export type EmailPayload = {
    to: string[],
    from: string,
    subject: string,
    template: string,
    context: Record<string, any>
}