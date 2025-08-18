import { DATA } from "@/data/resume";
import { AIContext, ProjectContext, EducationContext, WorkContext, ContactContext } from "@/types/chat";

/**
 * Prepares AI context from portfolio DATA for roleplay conversations
 * This function transforms the portfolio data into a structured format
 * that can be used to generate contextual AI responses
 */
export function prepareAIContext(): AIContext {
    // Transform projects data for AI context
    const projects: ProjectContext[] = DATA.projects.map(project => ({
        name: project.title,
        description: project.description,
        technologies: [...project.technologies], // Convert readonly array to mutable array
        status: project.active ? "Active" : "Completed",
        dates: project.dates,
        links: {
            website: project.links.find(link => link.type === "Website")?.href,
            source: project.links.find(link => link.type === "Source")?.href,
        }
    }));

    // Transform education data for AI context
    const education: EducationContext[] = DATA.education.map(edu => ({
        institution: edu.school,
        degree: edu.degree,
        period: `${edu.start} - ${edu.end}`,
        description: edu.description
    }));

    // Transform work experience for AI context
    const workExperience: WorkContext[] = DATA.work.map(work => ({
        company: work.company,
        title: work.title,
        location: work.location,
        period: `${work.start} - ${work.end}`,
        description: work.description
    }));

    // Prepare contact information for AI context
    const contact: ContactContext = {
        email: DATA.contact.email,
        phone: DATA.contact.tel,
        social: {
            github: DATA.contact.social.GitHub?.url,
            linkedin: DATA.contact.social.LinkedIn?.url,
            twitter: DATA.contact.social.X?.url,
        }
    };

    // Create comprehensive AI context object
    const aiContext: AIContext = {
        name: DATA.name,
        role: "Full-stack Developer",
        location: DATA.location,
        experience: workExperience.length > 0
            ? `${workExperience[0].title} at ${workExperience[0].company} (${workExperience[0].period})`
            : "Recent B.Tech graduate with 1+ year of professional experience",
        skills: [...DATA.skills], // Convert readonly array to mutable array
        projects,
        education,
        contact,
        personality: "Passionate, results-driven developer with a keen interest in AI/ML and building scalable solutions. Friendly, professional, and always eager to discuss technology and innovation.",
        summary: DATA.summary
    };

    return aiContext;
}

/**
 * Formats AI context into a structured prompt for AI response generation
 * This function creates a comprehensive context string that can be used
 * as a system prompt for AI services
 */
export function formatAIPrompt(userMessage: string): string {
    const context = prepareAIContext();

    const systemPrompt = `You are ${context.name}, a ${context.role} from ${context.location}. 
You are having a conversation with a visitor to your portfolio website. Respond as yourself in first person, 
maintaining a ${context.personality.toLowerCase()} tone.

BACKGROUND:
${context.summary}

EXPERIENCE:
${context.experience}

SKILLS:
${context.skills.join(", ")}

PROJECTS:
${context.projects.map(project =>
        `- ${project.name} (${project.status}): ${project.description} 
    Technologies: ${project.technologies.join(", ")}`
    ).join("\n")}

EDUCATION:
${context.education.map(edu =>
        `- ${edu.degree} from ${edu.institution} (${edu.period})`
    ).join("\n")}

CONTACT:
Email: ${context.contact.email}
${context.contact.social.linkedin ? `LinkedIn: ${context.contact.social.linkedin}` : ''}
${context.contact.social.github ? `GitHub: ${context.contact.social.github}` : ''}

INSTRUCTIONS:
- Respond as ${context.name} in first person
- Be conversational, friendly, and professional
- Reference specific projects, skills, or experiences when relevant
- If asked about something not in your background, politely redirect or suggest contacting you directly
- Keep responses concise but informative (2-3 sentences typically)
- Show enthusiasm for technology and your work
- If asked about availability or hiring, mention they can reach out via email

User Message: ${userMessage}

Your Response:`;

    return systemPrompt;
}

/**
 * Generates enhanced contextual responses for common questions about skills and projects
 * This function provides template-based responses with professional yet personable tone
 * when AI service is unavailable or for quick responses
 */
export function generateTemplateResponse(userMessage: string): string {
    const context = prepareAIContext();
    const message = userMessage.toLowerCase();

    // Greeting and introduction responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || 
        message.includes('introduce') || message.includes('who are you')) {
        return `Hello! I'm ${context.name}, a passionate full-stack developer from ${context.location}. I love building scalable web applications and integrating AI/ML solutions to solve real-world problems. I recently graduated with a B.Tech in Computer Science and have been working at ADP, where I've helped improve operational efficiency by 35%. What would you like to know about my journey?`;
    }

    // Skills-related questions with enhanced context
    if (message.includes('skill') || message.includes('technology') || message.includes('tech stack') || 
        message.includes('programming') || message.includes('languages')) {
        const frontendSkills = context.skills.filter(skill =>
            ['react.js', 'next.js', 'typescript', 'javascript', 'tailwindcss', 'shadcn', 'html5', 'css3'].includes(skill.toLowerCase())
        );
        const backendSkills = context.skills.filter(skill =>
            ['node.js', 'express.js', 'spring boot', 'java', 'python', 'sql', 'postgres', 'prisma'].includes(skill.toLowerCase())
        );
        const aiSkills = context.skills.filter(s => 
            s.toLowerCase().includes('ai') || s.toLowerCase().includes('machine') || s.toLowerCase().includes('gemini') || s.toLowerCase().includes('langchain')
        );

        return `I work with a comprehensive tech stack! On the frontend, I'm proficient in ${frontendSkills.slice(0, 4).join(', ')}, creating responsive and user-friendly interfaces. For backend development, I use ${backendSkills.slice(0, 4).join(', ')}, building robust and scalable server-side applications. I'm particularly passionate about AI/ML technologies like ${aiSkills.join(', ')}, which I've integrated into projects like PaperSight AI. What specific technology interests you most?`;
    }

    // Enhanced project-related questions
    if (message.includes('project') || message.includes('work') || message.includes('built') || message.includes('created')) {
        // Check for specific project mentions
        if (message.includes('papersight')) {
            return `PaperSight AI is one of my most exciting recent projects! It's an innovative web application that uses Google's Gemini AI to summarize PDF documents, making it invaluable for researchers and professionals. I built it with Next.js, TypeScript, and integrated Langchain for advanced AI processing. The app can quickly extract key information from lengthy documents, saving users hours of reading time!`;
        }
        
        if (message.includes('sleek')) {
            return `Sleek is my full-stack e-commerce application that showcases modern web development practices! I built it with Next.js for the frontend and Node.js/Express for the backend, using PostgreSQL with Prisma ORM for data management. The app features a seamless shopping experience with secure payment processing and a polished user interface.`;
        }
        
        if (message.includes('quickpay')) {
            return `QuickPay is my full-stack payment platform similar to PayTM! I built it to handle secure transactions, user authentication, and bank linking. The backend uses Express.js with PostgreSQL and Prisma, while the frontend is built with React and Next.js. I integrated webhooks for real-time bank API communication and optimized deployment with Docker and Turborepo.`;
        }

        const featuredProjects = context.projects.slice(0, 3);
        return `I've worked on several exciting projects that showcase different aspects of my skills! My recent work includes ${featuredProjects.map(p => p.name).join(', ')}. Each project taught me something new - from AI integration in PaperSight AI to secure payment processing in QuickPay, and modern e-commerce development in Sleek. I also developed a machine learning model for psychiatric disorder prediction with 93% accuracy. Which project would you like to hear more about?`;
    }

    // Enhanced experience-related questions
    if (message.includes('experience') || message.includes('background') || message.includes('career') || 
        message.includes('adp') || message.includes('job')) {
        return `I'm currently working as a Member Technical at ADP in Hyderabad, where I've been since October 2023. I collaborate with Agile teams to develop employee management and tracking systems that serve over 5,000 employees. My work involves building responsive front-end components with React and TypeScript, as well as secure back-end functionalities using Spring Boot. I'm proud that our solutions have reduced manual HR tasks by 40% and improved operational efficiency by 35%!`;
    }

    // Enhanced contact/availability questions
    if (message.includes('contact') || message.includes('hire') || message.includes('available') || 
        message.includes('reach') || message.includes('email') || message.includes('connect')) {
        return `I'm always excited to discuss new opportunities and interesting projects! You can reach me at ${context.contact.email} for any professional inquiries. I'm also active on LinkedIn and GitHub where you can see more of my work. Whether it's about potential collaborations, technical discussions, or job opportunities, I'd love to hear from you and see how we might work together!`;
    }

    // Enhanced education questions
    if (message.includes('education') || message.includes('study') || message.includes('university') || 
        message.includes('degree') || message.includes('nehu')) {
        const edu = context.education[0];
        return `I completed my ${edu.degree} from ${edu.institution} (${edu.period}). During my studies, I focused on core computer science concepts like algorithms, data structures, machine learning, and artificial intelligence. I also studied computer vision, compiler design, operating systems, and computer networks. The combination of academic learning and hands-on coding has been invaluable in my development journey!`;
    }

    // Enhanced AI/ML specific questions
    if (message.includes('ai') || message.includes('ml') || message.includes('machine learning') || 
        message.includes('artificial intelligence') || message.includes('gemini')) {
        const aiProjects = context.projects.filter(p =>
            p.technologies.some(tech => tech.toLowerCase().includes('ai') || tech.toLowerCase().includes('ml') || tech.toLowerCase().includes('gemini'))
        );
        const aiSkills = context.skills.filter(s => 
            s.toLowerCase().includes('ai') || s.toLowerCase().includes('machine') || s.toLowerCase().includes('gemini') || s.toLowerCase().includes('langchain')
        );
        
        return `I'm really passionate about AI and machine learning! I've worked extensively with ${aiSkills.join(', ')}. ${aiProjects.length > 0 ? `In projects like ${aiProjects[0].name}, I've integrated AI to create intelligent document summarization capabilities.` : ''} I also developed a psychiatric disorder prediction model using multiple ML algorithms that achieved 93% accuracy. I love exploring how AI can solve real-world problems and make applications more intelligent!`;
    }

    // Location and personal questions
    if (message.includes('location') || message.includes('where') || message.includes('from') || 
        message.includes('assam') || message.includes('india')) {
        return `I'm from ${context.location}, a beautiful state in Northeast India known for its tea gardens and rich culture! I currently work remotely for ADP while being based here. The tech scene in India is incredibly vibrant, and I love being part of this growing ecosystem. Working remotely has given me the flexibility to contribute to global projects while staying connected to my roots!`;
    }

    // Specific technology deep dives
    if (message.includes('react') || message.includes('next.js') || message.includes('typescript')) {
        return `I'm really passionate about modern frontend development! I work extensively with React.js and Next.js, which I find perfect for building scalable, performant web applications. TypeScript is my go-to choice because it adds type safety and makes code more maintainable. In my projects like PaperSight AI and Sleek, I've leveraged Next.js features like server-side rendering and API routes. The React ecosystem is constantly evolving, and I love staying up-to-date with the latest patterns!`;
    }

    if (message.includes('backend') || message.includes('server') || message.includes('api') || 
        message.includes('spring boot') || message.includes('express')) {
        return `I enjoy working on both sides of the stack! For backend development, I use Node.js with Express.js for JavaScript-based projects and Spring Boot with Java for enterprise applications. At ADP, I work extensively with Spring Boot, Spring Security, and Spring Data JPA to build secure, scalable backend systems. I also use PostgreSQL for database management and have experience with Prisma ORM for type-safe database operations!`;
    }

    // Goals and future questions
    if (message.includes('goal') || message.includes('future') || message.includes('plan') || 
        message.includes('aspiration') || message.includes('next')) {
        return `I'm excited about continuing to grow as a full-stack developer while deepening my expertise in AI/ML integration! My immediate goals include expanding my knowledge of cloud technologies like AWS and exploring more advanced AI frameworks. I'm particularly interested in how AI can be integrated into everyday applications to solve real problems. Long-term, I'd love to work on products that have a meaningful impact on people's lives!`;
    }

    // Default response for general questions with enhanced personality
    return `That's a great question! I'm ${context.name}, a full-stack developer passionate about building innovative web applications and AI solutions. I love discussing technology, sharing experiences about my projects like PaperSight AI and Sleek, or talking about my work at ADP. Whether you're curious about my technical skills, project experiences, or just want to chat about the latest in web development and AI, I'm here to help! What specific aspect would you like to explore further?`;
}

/**
 * Comprehensive input validation for security and content filtering
 */
export function validateUserInput(input: string): { isValid: boolean; error?: string; sanitized?: string } {
    // Check if input exists and is a string
    if (!input || typeof input !== 'string') {
        return { isValid: false, error: 'Message must be a non-empty string' };
    }

    const trimmed = input.trim();
    
    // Check for empty input
    if (trimmed.length === 0) {
        return { isValid: false, error: 'Message cannot be empty' };
    }

    // Check length limits
    if (trimmed.length > 500) {
        return { isValid: false, error: 'Message exceeds maximum length of 500 characters' };
    }

    // Check for minimum length
    if (trimmed.length < 2) {
        return { isValid: false, error: 'Message is too short. Please provide at least 2 characters' };
    }

    // Enhanced XSS protection patterns
    const xssPatterns = [
        /javascript:/gi,
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
        /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
        /<embed[\s\S]*?>/gi,
        /<link[\s\S]*?>/gi,
        /<meta[\s\S]*?>/gi,
        /on\w+\s*=/gi,
        /expression\s*\(/gi,
        /vbscript:/gi,
        /data:text\/html/gi,
        /@import/gi,
        /binding:/gi,
        /behavior:/gi,
    ];

    // Check for XSS patterns
    for (const pattern of xssPatterns) {
        if (pattern.test(trimmed)) {
            return { isValid: false, error: 'Message contains potentially harmful content' };
        }
    }

    // Check for suspicious SQL injection patterns
    const sqlPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
        /(--|\/\*|\*\/|;)/g,
        /(\b(or|and)\s+\d+\s*=\s*\d+)/gi,
    ];

    for (const pattern of sqlPatterns) {
        if (pattern.test(trimmed)) {
            return { isValid: false, error: 'Message contains invalid characters or patterns' };
        }
    }

    // Check for excessive special characters (potential spam)
    const specialCharCount = (trimmed.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (specialCharCount > trimmed.length * 0.3) {
        return { isValid: false, error: 'Message contains too many special characters' };
    }

    // Check for repeated characters (potential spam)
    const repeatedCharPattern = /(.)\1{10,}/g;
    if (repeatedCharPattern.test(trimmed)) {
        return { isValid: false, error: 'Message contains excessive repeated characters' };
    }

    // Sanitize the input
    const sanitized = sanitizeUserInput(trimmed);
    
    return { isValid: true, sanitized };
}

/**
 * Enhanced sanitization function for user input
 * Ensures safe processing of user messages before context generation
 */
export function sanitizeUserInput(input: string): string {
    return input
        .trim()
        .slice(0, 500) // Enforce character limit
        // Remove HTML tags more comprehensively
        .replace(/<[^>]*>/g, '')
        // Remove potentially harmful protocols
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '')
        // Remove event handlers
        .replace(/on\w+\s*=/gi, '')
        // Remove CSS expressions
        .replace(/expression\s*\(/gi, '')
        // Remove import statements
        .replace(/@import/gi, '')
        // Remove binding/behavior
        .replace(/(binding|behavior):/gi, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Remove null bytes and control characters
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Extracts key topics from user message for better context matching
 * Helps identify the most relevant context to include in AI responses
 */
export function extractMessageTopics(message: string): string[] {
    const context = prepareAIContext();
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Check for skill mentions
    context.skills.forEach(skill => {
        if (lowerMessage.includes(skill.toLowerCase())) {
            topics.push(`skill:${skill}`);
        }
    });

    // Check for project mentions
    context.projects.forEach(project => {
        if (lowerMessage.includes(project.name.toLowerCase())) {
            topics.push(`project:${project.name}`);
        }
    });

    // Check for general topic categories
    const topicKeywords = {
        'experience': ['experience', 'work', 'job', 'career', 'professional'],
        'education': ['education', 'study', 'university', 'degree', 'school'],
        'projects': ['project', 'built', 'created', 'developed', 'application'],
        'skills': ['skill', 'technology', 'tech', 'programming', 'language'],
        'contact': ['contact', 'reach', 'hire', 'available', 'email'],
        'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gemini']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            topics.push(`category:${topic}`);
        }
    });

    return topics;
}