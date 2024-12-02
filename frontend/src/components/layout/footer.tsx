
export default function Footer() {
    return (
        <footer className="container w-full mx-auto flex flex-col gap-2 px-4 py-2 text-center text-xs text-gray-500 mt-auto">
            <p className="mb-2">Welcome to our text optimization tool that helps improve your writing with enhanced readability. It checks for spelling, grammar, and punctuation errors and suggests fixes.</p>
            <p className="mb-2">As we're actively developing this service, features and functionality may change frequently while we improve the experience. Bugs are to be expected and can be reported at: <a href="https://airtable.com/app2pOTwziv6QG4p2/pag5rkh8ma3LTpvl5/form" target="_blank" rel="noreferrer" className="underline">https://airtable.com/app2pOTwziv6QG4p2/pag5rkh8ma3LTpvl5/form</a></p>
            <p className="mb-4">For transparency, we store <a href="#wip" target="_blank" rel="noreferrer" className="underline">necessary data</a> for user management, functionality, and analytics; text is sent to the OpenAI API, adhering to its <a href="https://openai.com/policies" target="_blank" rel="noopener noreferrer" className="underline">policies</a>.</p>
        </footer>
    );
}