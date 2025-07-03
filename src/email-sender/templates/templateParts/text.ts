// eslint-disable-next-line default-param-last
export const TEXT = (content: string, size: string = '20px', extraStyles?: string) => `
    <p style="font-family: Arial, Helvetica, sans-serif; font-size: ${size}; text-align: start; color: white${extraStyles ? `; ${extraStyles}` : ''}">
        ${content}
    </p>`
