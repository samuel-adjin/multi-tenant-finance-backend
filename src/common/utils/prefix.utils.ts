export const extractTenantPrefix = (name: string) => {
    if (!name || !name.trim()) {
        throw new Error("Name can not be empty")
    }
    const arr = name.toUpperCase().split(" ").filter(part => part.trim());
    let partA = arr[0];
    if (partA.length > 2) {
        partA = partA.substring(0, 2);
    }
    let partB = arr[1]?.substring(0, 1) ?? "";
    return partA + partB;
}

export const customerNumberGenerator = (prefix: string, code: string, sequence: string) => {
    if (!prefix || !code || !sequence) {
        throw new Error("Null values are not allowed")
    }
    if (!prefix.trim() || !code.trim() || !sequence.trim()) {
        throw new Error("Empty values are not allowed")
    }
    const year = new Date().getFullYear();
    return `${prefix}-${code}-${year}-${sequence}`
}

