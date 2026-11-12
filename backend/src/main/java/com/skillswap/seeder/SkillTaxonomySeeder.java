package com.skillswap.seeder;

import com.skillswap.model.Skill;
import com.skillswap.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class SkillTaxonomySeeder implements CommandLineRunner {

    private final SkillRepository skillRepository;

    @Override
    public void run(String... args) {
        if (skillRepository.count() > 0) {
            log.info("Skill taxonomy already seeded (count: {}). Skipping seeder.", skillRepository.count());
            return;
        }

        log.info("Seeding comprehensive 100+ skill taxonomy...");

        List<Skill> skills = new ArrayList<>();

        // 1. Technology & Programming
        add(skills, "Python", "technology-programming", "Technology & Programming", List.of("python3", "data science", "scripting", "django", "fastapi"), "Code");
        add(skills, "Java", "technology-programming", "Technology & Programming", List.of("spring", "backend", "oop", "jvm"), "Coffee");
        add(skills, "TypeScript", "technology-programming", "Technology & Programming", List.of("ts", "javascript", "web dev", "frontend"), "Code");
        add(skills, "React", "technology-programming", "Technology & Programming", List.of("reactjs", "frontend", "ui", "hooks"), "Atom");
        add(skills, "Next.js", "technology-programming", "Technology & Programming", List.of("nextjs", "ssr", "fullstack", "react"), "Layers");
        add(skills, "Node.js", "technology-programming", "Technology & Programming", List.of("nodejs", "express", "backend js"), "Server");
        add(skills, "Spring Boot", "technology-programming", "Technology & Programming", List.of("spring", "java backend", "rest api", "microservices"), "Shield");
        add(skills, "Go (Golang)", "technology-programming", "Technology & Programming", List.of("golang", "systems", "concurrency", "backend"), "Cpu");
        add(skills, "Rust", "technology-programming", "Technology & Programming", List.of("systems programming", "memory safety", "wasm"), "Cpu");
        add(skills, "Swift & iOS", "technology-programming", "Technology & Programming", List.of("swift", "swiftui", "ios app", "apple"), "Smartphone");
        add(skills, "Kotlin & Android", "technology-programming", "Technology & Programming", List.of("kotlin", "android dev", "mobile apps"), "Smartphone");
        add(skills, "Docker & Containers", "technology-programming", "Technology & Programming", List.of("docker", "containers", "devops"), "Box");
        add(skills, "Kubernetes", "technology-programming", "Technology & Programming", List.of("k8s", "orchestration", "cloud native"), "Cloud");
        add(skills, "SQL & Database Design", "technology-programming", "Technology & Programming", List.of("sql", "postgres", "mysql", "database"), "Database");
        add(skills, "MongoDB", "technology-programming", "Technology & Programming", List.of("nosql", "document db", "mongodb atlas"), "Database");
        add(skills, "Machine Learning", "technology-programming", "Technology & Programming", List.of("ml", "ai", "deep learning", "pytorch", "tensorflow"), "Brain");
        add(skills, "Git & Version Control", "technology-programming", "Technology & Programming", List.of("git", "github", "vcs"), "GitBranch");
        add(skills, "Cybersecurity & Ethical Hacking", "technology-programming", "Technology & Programming", List.of("security", "penetration testing", "infosec"), "Lock");
        add(skills, "GraphQL", "technology-programming", "Technology & Programming", List.of("graphql", "api query", "apollo"), "Share2");
        add(skills, "Cloud Architecture (AWS)", "technology-programming", "Technology & Programming", List.of("aws", "cloud", "s3", "ec2", "lambda"), "Cloud");

        // 2. Design & Creative
        add(skills, "UI/UX Design", "design-creative", "Design & Creative", List.of("user experience", "user interface", "wireframing", "interaction design"), "Layout");
        add(skills, "Figma Mastery", "design-creative", "Design & Creative", List.of("figma", "prototyping", "design systems", "auto layout"), "Figma");
        add(skills, "Graphic Design", "design-creative", "Design & Creative", List.of("branding", "poster design", "visual design"), "Palette");
        add(skills, "3D Modeling & Rendering", "design-creative", "Design & Creative", List.of("3d", "maya", "cinema4d", "rendering"), "Box");
        add(skills, "Blender", "design-creative", "Design & Creative", List.of("blender 3d", "cgi", "animation 3d"), "Feather");
        add(skills, "Typography & Layout", "design-creative", "Design & Creative", List.of("fonts", "typesetting", "editorial design"), "Type");
        add(skills, "Motion Design & 2D Animation", "design-creative", "Design & Creative", List.of("animation", "motion graphics", "lottie"), "Film");
        add(skills, "Video Editing (Premiere Pro)", "design-creative", "Design & Creative", List.of("premiere", "video production", "cutting"), "Video");
        add(skills, "DaVinci Resolve & Color Grading", "design-creative", "Design & Creative", List.of("davinci", "colorist", "post production"), "Video");
        add(skills, "Adobe After Effects", "design-creative", "Design & Creative", List.of("after effects", "vfx", "compositing"), "Sparkles");
        add(skills, "Digital Illustration", "design-creative", "Design & Creative", List.of("procreate", "drawing", "concept art"), "Edit3");
        add(skills, "Portrait & Street Photography", "design-creative", "Design & Creative", List.of("photo", "camera", "lightroom", "framing"), "Camera");
        add(skills, "Product Design & Industrial Design", "design-creative", "Design & Creative", List.of("hardware design", "cad", "ergonomics"), "Compass");
        add(skills, "Logo & Brand Identity Design", "design-creative", "Design & Creative", List.of("logos", "visual identity", "guidelines"), "Award");

        // 3. Languages & Linguistics
        add(skills, "Spanish Conversational & Grammar", "languages-linguistics", "Languages & Linguistics", List.of("espanol", "spanish", "castilian"), "Languages");
        add(skills, "French Language & Culture", "languages-linguistics", "Languages & Linguistics", List.of("francais", "french", "pronunciation"), "Languages");
        add(skills, "Japanese (JLPT / Conversational)", "languages-linguistics", "Languages & Linguistics", List.of("nihongo", "kanji", "hiragana", "japanese"), "Languages");
        add(skills, "Mandarin Chinese", "languages-linguistics", "Languages & Linguistics", List.of("putonghua", "chinese", "pinyin", "characters"), "Languages");
        add(skills, "German Language", "languages-linguistics", "Languages & Linguistics", List.of("deutsch", "german grammar"), "Languages");
        add(skills, "Italian Language", "languages-linguistics", "Languages & Linguistics", List.of("italiano", "italian conversation"), "Languages");
        add(skills, "Korean (Hangul & Spoken)", "languages-linguistics", "Languages & Linguistics", List.of("hangul", "korean speaking", "k-culture"), "Languages");
        add(skills, "Portuguese (Brazilian & European)", "languages-linguistics", "Languages & Linguistics", List.of("portugues", "brazilian portuguese"), "Languages");
        add(skills, "Russian Language", "languages-linguistics", "Languages & Linguistics", List.of("cyrillic", "russian conversation"), "Languages");
        add(skills, "Modern Standard Arabic", "languages-linguistics", "Languages & Linguistics", List.of("arabic script", "arabic dialect"), "Languages");
        add(skills, "Hindi Conversational", "languages-linguistics", "Languages & Linguistics", List.of("hindi", "devanagari", "spoken hindi"), "Languages");
        add(skills, "English ESL & Accent Coaching", "languages-linguistics", "Languages & Linguistics", List.of("english", "toefl", "ielts", "accent reduction"), "Languages");
        add(skills, "American Sign Language (ASL)", "languages-linguistics", "Languages & Linguistics", List.of("asl", "sign language", "deaf culture"), "Hand");

        // 4. Music & Audio
        add(skills, "Acoustic Guitar", "music-audio", "Music & Audio", List.of("fingerstyle", "chords", "folk guitar", "strumming"), "Music");
        add(skills, "Electric Guitar & Solos", "music-audio", "Music & Audio", List.of("rock guitar", "scales", "lead guitar", "pedals"), "Music");
        add(skills, "Piano & Keyboard", "music-audio", "Music & Audio", List.of("classical piano", "jazz piano", "chords"), "Music");
        add(skills, "Music Production (Ableton Live)", "music-audio", "Music & Audio", List.of("ableton", "electronic music", "beats", "synth"), "Sliders");
        add(skills, "Logic Pro & Studio Production", "music-audio", "Music & Audio", List.of("logic pro", "recording", "midi"), "Sliders");
        add(skills, "Vocal Training & Singing", "music-audio", "Music & Audio", List.of("vocals", "pitch control", "breath support", "voice"), "Mic");
        add(skills, "Drums & Percussion", "music-audio", "Music & Audio", List.of("drum kit", "rhythm", "groove", "beats"), "Music");
        add(skills, "Bass Guitar", "music-audio", "Music & Audio", List.of("electric bass", "slap bass", "walking bass"), "Music");
        add(skills, "Violin & Fiddle", "music-audio", "Music & Audio", List.of("violin", "classical strings", "bowing"), "Music");
        add(skills, "Ukulele", "music-audio", "Music & Audio", List.of("ukulele chords", "hawaiian uke"), "Music");
        add(skills, "Songwriting & Lyric Composition", "music-audio", "Music & Audio", List.of("song structure", "harmonies", "lyrics"), "PenTool");
        add(skills, "Audio Mixing & Mastering", "music-audio", "Music & Audio", List.of("eq", "compression", "mastering", "sound engineering"), "Headphones");
        add(skills, "DJing & Beatmatching", "music-audio", "Music & Audio", List.of("dj", "rekordbox", "turntables", "electronic sets"), "Disc");

        // 5. Business & Career
        add(skills, "Product Management", "business-career", "Business & Career", List.of("pm", "roadmapping", "user stories", "prds"), "Briefcase");
        add(skills, "Digital Marketing & Growth", "business-career", "Business & Career", List.of("growth marketing", "social media", "funnels"), "TrendingUp");
        add(skills, "Public Speaking & Presentations", "business-career", "Business & Career", List.of("keynotes", "oratory", "storytelling", "pitching"), "Mic2");
        add(skills, "Resume Writing & Tech Interview Prep", "business-career", "Business & Career", List.of("resume review", "system design interview", "leetcode strategy"), "FileText");
        add(skills, "Search Engine Optimization (SEO)", "business-career", "Business & Career", List.of("organic search", "backlinks", "technical seo"), "Search");
        add(skills, "Financial Modeling & Excel Mastery", "business-career", "Business & Career", List.of("excel", "dcf models", "spreadsheets", "valuation"), "PieChart");
        add(skills, "Startup Pitching & Fundraising", "business-career", "Business & Career", List.of("pitch deck", "venture capital", "angel funding"), "DollarSign");
        add(skills, "B2B Sales & Negotiation Tactics", "business-career", "Business & Career", List.of("sales", "objection handling", "closing"), "Handshake");
        add(skills, "Copywriting & Persuasive Writing", "business-career", "Business & Career", List.of("conversion copy", "landing pages", "email campaigns"), "Feather");
        add(skills, "Agile & Scrum Methodologies", "business-career", "Business & Career", List.of("scrum master", "sprints", "kanban"), "CheckSquare");

        // 6. Health & Wellness
        add(skills, "Vinyasa & Hatha Yoga", "health-wellness", "Health & Wellness", List.of("yoga flows", "asanas", "flexibility"), "Heart");
        add(skills, "Mindfulness & Guided Meditation", "health-wellness", "Health & Wellness", List.of("meditation", "vipassana", "stress relief"), "Sun");
        add(skills, "Calisthenics & Bodyweight Training", "health-wellness", "Health & Wellness", List.of("pull-ups", "handstands", "muscle-ups"), "Activity");
        add(skills, "Nutrition & Evidence-Based Meal Planning", "health-wellness", "Health & Wellness", List.of("macros", "dietetics", "healthy eating"), "Apple");
        add(skills, "Distance Running & Marathon Prep", "health-wellness", "Health & Wellness", List.of("5k", "half marathon", "running form", "cadence"), "FastForward");
        add(skills, "Barbell Strength Training", "health-wellness", "Health & Wellness", List.of("squats", "deadlifts", "powerlifting"), "Dumbbell");
        add(skills, "Pilates Core Conditioning", "health-wellness", "Health & Wellness", List.of("mat pilates", "posture", "core strength"), "Smile");
        add(skills, "Pranayama & Breathwork Techniques", "health-wellness", "Health & Wellness", List.of("box breathing", "wim hof", "relaxation"), "Wind");

        // 7. Craft & DIY
        add(skills, "Woodworking & Joinery", "craft-diy", "Craft & DIY", List.of("carpentry", "furniture making", "hand tools"), "Tool");
        add(skills, "Ceramics & Wheel Throwing", "craft-diy", "Craft & DIY", List.of("pottery", "glazing", "clay sculpting"), "Coffee");
        add(skills, "Knitting & Crochet", "craft-diy", "Craft & DIY", List.of("yarn craft", "patterns", "textiles"), "Scissors");
        add(skills, "Sewing & Garment Alterations", "craft-diy", "Craft & DIY", List.of("tailoring", "pattern drafting", "fashion craft"), "Scissors");
        add(skills, "Watercolor Painting", "craft-diy", "Craft & DIY", List.of("watercolour", "wet-on-wet", "landscapes"), "Droplet");
        add(skills, "Oil & Acrylic Painting", "craft-diy", "Craft & DIY", List.of("canvas", "color theory", "brushwork"), "PenTool");
        add(skills, "Leathercraft & Tooling", "craft-diy", "Craft & DIY", List.of("hand-stitched leather", "wallets", "belts"), "Shield");
        add(skills, "Origami & Paper Craft", "craft-diy", "Craft & DIY", List.of("paper folding", "geometric origami"), "File");
        add(skills, "Organic Gardening & Permaculture", "craft-diy", "Craft & DIY", List.of("vegetable garden", "composting", "soil health"), "Sun");

        // 8. Academic & Sciences
        add(skills, "Calculus & Linear Algebra", "academic-sciences", "Academic & Sciences", List.of("derivatives", "integrals", "eigenvectors", "matrix math"), "Hash");
        add(skills, "Physics (Mechanics & Electromagnetism)", "academic-sciences", "Academic & Sciences", List.of("classical mechanics", "circuits", "quantum intro"), "Zap");
        add(skills, "Organic Chemistry", "academic-sciences", "Academic & Sciences", List.of("reaction mechanisms", "synthesis", "functional groups"), "Thermometer");
        add(skills, "Molecular & Cellular Biology", "academic-sciences", "Academic & Sciences", List.of("genetics", "dna", "cellular respiration"), "Activity");
        add(skills, "Data Science & Applied Statistics", "academic-sciences", "Academic & Sciences", List.of("hypothesis testing", "regression", "probability", "r stats"), "BarChart");
        add(skills, "Microeconomics & Game Theory", "academic-sciences", "Academic & Sciences", List.of("nash equilibrium", "supply and demand", "market structures"), "DollarSign");
        add(skills, "Philosophy & Formal Logic", "academic-sciences", "Academic & Sciences", List.of("ethics", "epistemology", "syllogisms", "critical thinking"), "BookOpen");
        add(skills, "Creative Writing & Narrative Craft", "academic-sciences", "Academic & Sciences", List.of("short fiction", "character arcs", "prose style"), "Book");

        skillRepository.saveAll(skills);
        log.info("Skill taxonomy successfully seeded with {} skills!", skills.size());
    }

    private void add(List<Skill> list, String name, String slug, String category, List<String> aliases, String icon) {
        String cleanSlug = name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        list.add(Skill.builder()
                .name(name)
                .slug(cleanSlug)
                .category(category)
                .aliases(aliases)
                .iconName(icon)
                .description("Master and share knowledge in " + name)
                .build());
    }
}
