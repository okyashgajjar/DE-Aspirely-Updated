export function mapSkillsToJobRoles(skills: string[]): string[] {
    const roles = new Set<string>();

    const mapping: Record<string, string[]> = {
        react: ["Frontend Developer", "React Developer", "Full Stack Engineer"],
        "next.js": ["Frontend Developer", "React Developer"],
        typescript: ["Frontend Engineer", "TypeScript Developer", "Full Stack Developer"],
        javascript: ["Frontend Developer", "JavaScript Engineer", "Web Developer"],
        "node.js": ["Backend Engineer", "Node.js Developer", "Full Stack Developer"],
        python: ["Python Developer", "Data Scientist", "Backend Engineer", "Machine Learning Engineer"],
        django: ["Python Developer", "Backend Engineer"],
        flask: ["Python Developer", "Backend Engineer"],
        java: ["Java Developer", "Backend Engineer", "Software Engineer"],
        spring: ["Java Developer", "Backend Engineer"],
        kotlin: ["Android Developer", "Backend Engineer"],
        go: ["Go Developer", "Backend Engineer", "Systems Engineer"],
        ruby: ["Ruby Developer", "Backend Engineer"],
        rails: ["Ruby on Rails Developer", "Full Stack Engineer"],
        sql: ["Data Analyst", "Database Administrator", "Backend Engineer"],
        postgres: ["Database Administrator", "Backend Engineer"],
        mysql: ["Database Administrator", "Backend Engineer"],
        mongodb: ["Database Administrator", "Backend Engineer"],
        aws: ["Cloud Engineer", "DevOps Engineer"],
        gcp: ["Cloud Engineer", "DevOps Engineer"],
        azure: ["Cloud Engineer", "DevOps Engineer"],
        docker: ["DevOps Engineer", "Site Reliability Engineer"],
        kubernetes: ["DevOps Engineer", "Site Reliability Engineer"],
        redis: ["Backend Engineer"],
        graphql: ["Backend Engineer", "Full Stack Developer"],
        rest: ["Backend Engineer"],
        html: ["Frontend Developer", "Web Developer"],
        css: ["Frontend Developer", "Web UI Developer"],
        tailwind: ["Frontend Developer", "UI Developer"],
        "system design": ["Senior Software Engineer", "Systems Architect"],
        "data engineering": ["Data Engineer"],
        ml: ["Machine Learning Engineer", "AI Engineer"],
        "machine learning": ["Machine Learning Engineer", "AI Researcher"],
        "data science": ["Data Scientist", "Data Analyst"],
        "product management": ["Product Manager"],
        design: ["UX/UI Designer", "Product Designer"],
        ux: ["UX Researcher", "UX Designer"],
    };

    const normalizedInput = skills.map((s) => s.toLowerCase().trim());

    for (const skill of normalizedInput) {
        if (mapping[skill]) {
            mapping[skill].forEach((role) => roles.add(role));
        }
    }

    // If no specific roles found, return a generic fallback
    if (roles.size === 0) {
        return ["Software Engineer"];
    }

    return Array.from(roles);
}

const ukCities = ["london", "manchester", "birmingham", "leeds", "glasgow", "sheffield", "edinburgh", "bristol", "liverpool"];
const usCities = ["new york", "san francisco", "los angeles", "chicago", "boston", "seattle", "austin", "remote", "us"];
const caCities = ["toronto", "vancouver", "montreal", "calgary", "ottawa"];
const auCities = ["sydney", "melbourne", "brisbane", "perth", "adelaide"];
const inCities = ["mumbai", "bangalore", "bengaluru", "delhi", "hyderabad", "pune", "chennai", "india"];

export function getCountryCode(location: string | null | undefined): string {
    if (!location) return "gb"; // Default fallback if no location

    const norm = location.toLowerCase().trim();

    if (norm.includes("uk") || norm.includes("united kingdom")) return "gb";
    if (norm.includes("us") || norm.includes("united states") || norm.includes("usa")) return "us";
    if (norm.includes("canada") || norm.includes("ca")) return "ca";
    if (norm.includes("australia") || norm.includes("au")) return "au";
    if (norm.includes("india") || norm.includes("in")) return "in";

    for (const city of ukCities) {
        if (norm.includes(city)) return "gb";
    }
    for (const city of usCities) {
        if (norm.includes(city)) return "us";
    }
    for (const city of caCities) {
        if (norm.includes(city)) return "ca";
    }
    for (const city of auCities) {
        if (norm.includes(city)) return "au";
    }
    for (const city of inCities) {
        if (norm.includes(city)) return "in";
    }

    // Default to GB as it has the most comprehensive data on free tier Adzuna
    return "gb";
}
