import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Fazlul Karim Choudhury",
  initials: "FKC",
  url: "https://fazlul.vercel.app",
  location: "Assam, India",
  locationLink: "https://maps.app.goo.gl/Qq2xZv7BppgadHW76",
  description:
    "Full-stack developer with 1+ year experience in building scalable platforms and AI/ML projects.",
  summary:
    "Hello! My name is Fazlul Karim Choudhury, a passionate and results-driven full-stack developer with a strong foundation in building scalable web applications and a keen interest in integrating AI/ML solutions to solve real-world problems. I recently graduated with a B.Tech in Computer Science from NEHU and have since honed my skills through hands-on experience at Automatic Data Processing (ADP) and impactful personal projects",
  avatarUrl: "/me.png",
  skills: [
    "React.js",
    "Next.js",
    "Typescript",
    "JavaScript",
    "TailwindCSS",
    "Shadcn",
    "Prisma",
    "Node.js",
    "Express.js",
    "Python",
    "Machine Learning",
    "langchain",
    "Gemini AI",
    "HTML5",
    "CSS3",
    "C++",
    "Java",
    "Spring Boot",
    "SQL",
    "Postgres",
    "Docker",
    "Git",
    "AWS",
    "CI/CD",
    "Agile",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    // { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "fazlul0127@gmail.com",
    tel: "+91 8486853823",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/FazlulKarimC",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/fazlul0127/",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/FazlulKarim_fk",
        icon: Icons.x,

        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:fazlul0127@gmail.com",
        icon: Icons.email,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "ADP",
      href: "https://www.adp.com/",
      badges: [],
      location: "Hyderabad, India",
      title: "Member Technical",
      logoUrl: "/ADP.png",
      start: "Oct 2023",
      end: "Sept 2024",
      description:
        `At ADP, I served as a Member Technical where I collaborated with Agile teams to develop an employee management
        and tracking system. My responsibilities included designing responsive front-end components using ReactJS, JavaScript,
        and TypeScript, as well as building secure back-end functionalities with Spring Boot, Spring Security, and Spring Data JPA. 
        These efforts helped streamline HR operations, reduce manual tasks by 40%, and improve overall operational 
        efficiency by 35% for a user base of 5,000 employees.`,
    }
  ],
  education: [
    {
      school: "NEHU",
      href: "https://www.nehu.ac.in/",
      degree: "B.Tech in Computer Science",
      logoUrl: "https://www.clipartmax.com/png/small/362-3626272_north-eastern-hill-university-logo.png",
      start: "2019",
      end: "2023",
      description:"C, C++, Python, Java, Advanced Algorithms, Data Structure, Machine Learning, Artificial Intelligence, OOPS, Computer Vision, Compiler Design, Operating System, Computer Network and Mathematics"
    }
  ],
  projects: [
    {
      title: "PaperSightAI",
      href: "https://papersight.vercel.app",
      dates: "Jan 2025 - Present",
      active: true,
      description:
        `PaperSight AI is an innovative web application designed to simplify the process of summarizing 
        and managing PDF documents using advanced AI technology. Built with Next.js, PaperSight AI leverages 
        the power of Google's Gemini AI model to provide concise summaries of uploaded PDFs, making it an 
        invaluable tool for researchers, students, and professionals who need to quickly extract key information 
        from lengthy documents`,
      technologies: [
        "Next.js",
        "Typescript",
        "PostgreSQL",
        "NeonDB",
        "Langchain",
        "Clerk",
        "TailwindCSS",
        "Shadcn",
        "Node.js",
        "Gemini AI"],
      links: [
        {
          type: "Website",
          href: "https://papersight.vercel.app",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/FazlulKarimC/PaperSight_AI",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/papersight.png",
      video: "",
    },
    {
      title: "Sleek",
      href: "https://e-commerce-app-fazlul.vercel.app/",
      dates: "May 2025 - Present",
      active: true,
      description:
        `Sleek, full-stack Ecommerce Application built with a modern tech stack! Dive into a seamless
         shopping experience with a polished Next.js frontend and a powerful Node.js/Express backend, 
         all tied together with a PostgreSQL database managed via Prisma ORM`,
      technologies: [
        "Next.js",
        "Typescript",
        "PostgreSQL",
        "NeonDB",
        "Prisma",
        "TailwindCSS",
        "Shadcn",
        "Express.js",
        "Node.js",
        "Gemini AI"],
      links: [
        {
          type: "Website",
          href: "https://e-commerce-app-fazlul.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/FazlulKarimC/eCommerce_app",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/sleek.png",
      video: "",
    },
    {
      title: "QuickPay",
      href: "https://github.com/FazlulKarimC/QuickPay",
      dates: "Dec 2024 - Jan 2025",
      active: true,
      description:
        "A full-stack payment platform similar to PayTM, featuring authentication, secure transactions, transaction history, and bank linking. Built the backend with Express.js, PostgreSQL, and Prisma, integrating webhooks for real-time bank API communication. Designed a scalable frontend using React, Next.js, and TypeScript, improving page load time by 10%. Optimized deployment with Docker and Turborepo, reducing build times by 20% and deployment time by 15%.",
      technologies: [
        "Next.js",
        "Typescript",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "WebHooks",
        "NextAuth.js",
        "Node.js",
      ],
      links: [
        // {
        //   type: "Website",
        //   href: "https://chatcollect.com",
        //   icon: <Icons.globe className="size-3" />,
        // },
        {
          type: "Source",
          href: "https://github.com/FazlulKarimC/QuickPay",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/Quickpay.png",
      video: "",
    },
    {
      title: "Psychiatric Diagnosis",
      href: "https://github.com/FazlulKarimC/Detection-of-Psychiatric-Disorder-using-ML",
      dates: "Oct 2022 - Jan 2023",
      active: true,
      description:
        "Developed a machine learning model to predict psychiatric disorders using Logistic Regression, Decision Tree, Random Forest, and SVM. Enhanced accuracy by 93% through feature engineering and statistical analysis. Leveraged Scikit-learn for modeling, Matplotlib for visualization, and NumPy/Pandas for data preprocessing. Worked with Jupyter, Git, Python, and AI/ML techniques.",
      technologies: [
        "Python",
        "Machine Learning",
        "Scikit-learn",
        "Matplotlib",
        "NumPy",
        "Pandas",
        "Jupyter",
        "Git",
        "Streamlit"
      ],
      links: [
        // {
        //   type: "Website",
        //   href: "https://chatcollect.com",
        //   icon: <Icons.globe className="size-3" />,
        // },
        {
          type: "Source",
          href: "https://github.com/FazlulKarimC/Detection-of-Psychiatric-Disorder-using-ML",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/pdd.png",
      video: "",
    },
  ],
  hackathons: [],
} as const;
