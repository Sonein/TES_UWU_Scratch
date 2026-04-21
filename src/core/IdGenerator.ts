export function generateId(): string {

    return "sprite-" + Math.random().toString(36).substring(2, 9);

}