export const BUTTON = (url: string, text: string) => `
    <a href="${url}">
      <button
        style="
          font-family: Arial, Helvetica, sans-serif;
          background-color: #016BA7;
          border-radius: 8px;
          border: 8px solid #008EDE;
          font-size: 18px;
          text-decoration: none;
          color: white;
          padding: 6px 24px;
          margin: 16px;
        "
      >
        ${text} 
      </button>
    </a>`
