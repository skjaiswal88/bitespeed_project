import prisma from '../config/database';

// Defining a simple Contact interface to avoid importing the generated type if it's giving issues
interface Contact {
    id: number;
    phoneNumber: string | null;
    email: string | null;
    linkedId: number | null;
    linkPrecedence: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export const identifyContact = async (email: string | null, phoneNumber: string | null) => {
    // 1. Find contacts matching the exact email OR phoneNumber
    const matchingContacts = await prisma.contact.findMany({
        where: {
            OR: [
                ...(email ? [{ email }] : []),
                ...(phoneNumber ? [{ phoneNumber }] : []),
            ],
        },
    });

    // 2. If no matches, this is a new customer
    if (matchingContacts.length === 0) {
        const newContact = await prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkPrecedence: 'primary',
            },
        });

        return {
            contact: {
                primaryContatctId: newContact.id, // Spec explicit typo
                emails: newContact.email ? [newContact.email] : [],
                phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
                secondaryContactIds: [],
            },
        };
    }

    // 3. Matches found: collect the full linked cluster
    const primaryIds = [...new Set(matchingContacts.map((c: Contact) => c.linkedId || c.id))];

    let clusterContacts = await prisma.contact.findMany({
        where: {
            OR: [
                { id: { in: primaryIds } },
                { linkedId: { in: primaryIds } },
            ],
        },
    });

    // Determine the true primary (the oldest contact in the entire cluster)
    clusterContacts.sort((a: Contact, b: Contact) => a.createdAt.getTime() - b.createdAt.getTime());
    const truePrimary = clusterContacts[0];

    // Identify if multiple primary contacts are being merged
    const otherPrimaries = clusterContacts.filter(
        (c: Contact) => c.id !== truePrimary.id && c.linkPrecedence === 'primary' && primaryIds.includes(c.id)
    );

    const otherPrimaryIds = otherPrimaries.map((c: Contact) => c.id);

    if (otherPrimaryIds.length > 0) {
        // Update other primaries to be secondary and link to truePrimary
        await prisma.contact.updateMany({
            where: { id: { in: otherPrimaryIds } },
            data: {
                linkPrecedence: 'secondary',
                linkedId: truePrimary.id,
            },
        });

        // Update their linked children to point to truePrimary directly (flatten the tree)
        await prisma.contact.updateMany({
            where: { linkedId: { in: otherPrimaryIds } },
            data: {
                linkedId: truePrimary.id,
            },
        });

        // Re-fetch the updated cluster to reflect these changes
        clusterContacts = await prisma.contact.findMany({
            where: {
                OR: [{ id: truePrimary.id }, { linkedId: truePrimary.id }],
            },
        });
        clusterContacts.sort((a: Contact, b: Contact) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    // 4. Check if the incoming request has new information that requires creating a secondary contact
    const hasNewEmail = email && !clusterContacts.some((c: Contact) => c.email === email);
    const hasNewPhone = phoneNumber && !clusterContacts.some((c: Contact) => c.phoneNumber === phoneNumber);

    if (hasNewEmail || hasNewPhone) {
        const newSecondary = await prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkPrecedence: 'secondary',
                linkedId: truePrimary.id,
            },
        });
        clusterContacts.push(newSecondary);
    }

    // 5. Build the consolidated response
    const emails = [
        truePrimary.email,
        ...clusterContacts.map((c: Contact) => c.email).filter((e: string | null) => e !== truePrimary.email),
    ].filter(Boolean) as string[];

    const phoneNumbers = [
        truePrimary.phoneNumber,
        ...clusterContacts.map((c: Contact) => c.phoneNumber).filter((p: string | null) => p !== truePrimary.phoneNumber),
    ].filter(Boolean) as string[];

    const uniqueEmails = [...new Set(emails)];
    const uniquePhoneNumbers = [...new Set(phoneNumbers)];

    const secondaryContactIds = clusterContacts
        .filter((c: Contact) => c.id !== truePrimary.id)
        .map((c: Contact) => c.id);

    return {
        contact: {
            primaryContatctId: truePrimary.id, // Spec typo
            emails: uniqueEmails,
            phoneNumbers: uniquePhoneNumbers,
            secondaryContactIds,
        },
    };
};
