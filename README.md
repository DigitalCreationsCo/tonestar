This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Setup

Clone the repository or download the project files.

   ```
   git clone https://github.com/digitalcreationsco/kickstart-saas.git
   cd kickstart-saas
   ```

   Or, if you've downloaded a ZIP file, extract it and navigate to the project directory.

### Running the Configuration Wizard

This project includes a configuration wizard to help you set up your environment variables and other necessary configurations quickly and easily.

### Prerequisites

- Bash shell (Linux, macOS, or Windows with WSL)
- Git (optional, for cloning the repository)

1. Make the script executable:
   ```
   chmod +x config_wizard.sh
   ```

2. Run the script:
   ```
   ./config_wizard.sh
   ```

### What the Wizard Does

The configuration wizard will guide you through setting up:

- Database configuration (type, host, port, name, username, password)
- Domain URL
- OpenAI API key
- Stripe API keys (publishable and secret)

It will create or update a `.env` file in your project root with these configurations.

### After Running the Wizard

- The wizard will create or update a `.env` file with your configurations.
- Make sure to add `.env` to your `.gitignore` file if you're using git, to keep your secrets safe.
- You may need to restart your application for the changes to take effect.

## Troubleshooting

- If you encounter permission issues when trying to run the script, ensure you have the necessary permissions to execute files in the project directory.
- If you're on Windows and not using WSL, consider using Git Bash or another Bash-compatible shell to run the script.

## Customizing the Wizard

If you need to add more configuration options:

1. Open `config_wizard.sh` in a text editor.
2. Add new prompts and update the `.env` file sections as needed.
3. Save your changes.

## Support

If you encounter any issues or have questions about the configuration process, please open an issue in the project repository or contact the project maintainer.

Happy coding!

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


