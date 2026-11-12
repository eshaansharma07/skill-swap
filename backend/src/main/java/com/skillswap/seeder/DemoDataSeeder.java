package com.skillswap.seeder;

import com.skillswap.model.*;
import com.skillswap.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final SwapRequestRepository swapRequestRepository;
    private final SessionRepository sessionRepository;
    private final ReviewRepository reviewRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Demo users already present (count: {}). Skipping demo data seeder.", userRepository.count());
            return;
        }

        log.info("Seeding realistic demo personas, sessions, reviews, and conversations...");

        String defaultPasswordHash = passwordEncoder.encode("SkillSwap123!");
        String adminPasswordHash = passwordEncoder.encode("SkillSwapAdmin123!");

        // Helper to find skill
        Optional<Skill> pythonSkill = skillRepository.findBySlug("python");
        Optional<Skill> springSkill = skillRepository.findBySlug("spring-boot");
        Optional<Skill> guitarSkill = skillRepository.findBySlug("acoustic-guitar");
        Optional<Skill> musicTheorySkill = skillRepository.findBySlug("music-theory");
        Optional<Skill> uiUxSkill = skillRepository.findBySlug("ui-ux-design");
        Optional<Skill> figmaSkill = skillRepository.findBySlug("figma-design-systems");
        Optional<Skill> spanishSkill = skillRepository.findBySlug("spanish");

        // 1. Admin
        User admin = User.builder()
                .email("admin@skillswap.io")
                .username("admin")
                .name("Platform Admin")
                .passwordHash(adminPasswordHash)
                .role(Role.ADMIN)
                .status("ACTIVE")
                .bio("SkillSwap Platform Moderator and Taxonomy Administrator")
                .timezone("UTC")
                .languages(List.of("English"))
                .onboardingCompleted(true)
                .createdAt(Instant.now().minus(30, ChronoUnit.DAYS))
                .build();
        userRepository.save(admin);

        // 2. Elena Rostova (Python/Backend Guru wanting Guitar)
        List<UserSkill> elenaSkills = new ArrayList<>();
        pythonSkill.ifPresent(s -> elenaSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.TEACH).level(SkillLevel.EXPERT).yearsExp(6)
                .description("Production distributed microservices, FastAPI, async programming, and data engineering.")
                .build()));
        springSkill.ifPresent(s -> elenaSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.TEACH).level(SkillLevel.ADVANCED).yearsExp(5)
                .description("Spring Boot 3, Spring Security, MongoDB, Docker, and REST architectures.")
                .build()));
        guitarSkill.ifPresent(s -> elenaSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.LEARN).level(SkillLevel.BEGINNER)
                .description("Eager to learn fingerpicking, Travis picking, and acoustic songwriting basics.")
                .build()));
        spanishSkill.ifPresent(s -> elenaSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.LEARN).level(SkillLevel.BEGINNER)
                .description("Conversational Spanish for travel and culture.")
                .build()));

        User elena = User.builder()
                .email("elena@example.com")
                .username("elenar")
                .name("Elena Rostova")
                .passwordHash(defaultPasswordHash)
                .role(Role.USER)
                .status("ACTIVE")
                .bio("Senior Backend Architect in London. Love clean architectures, distributed systems, and mentorship. Looking to pick up acoustic fingerstyle guitar!")
                .timezone("Europe/London")
                .languages(List.of("English", "Russian"))
                .location(UserLocation.builder().city("London").country("United Kingdom").mode(SessionMode.ONLINE).build())
                .availability(List.of(
                        new AvailabilitySlot("MONDAY", List.of("EVENING")),
                        new AvailabilitySlot("WEDNESDAY", List.of("EVENING")),
                        new AvailabilitySlot("SATURDAY", List.of("MORNING", "AFTERNOON"))
                ))
                .skills(elenaSkills)
                .reputation(UserReputation.builder()
                        .ratingAverage(4.95)
                        .totalReviews(14)
                        .sessionsCompleted(15)
                        .badges(List.of("Top Teacher", "Verified Expert", "Founding Member"))
                        .build())
                .onboardingCompleted(true)
                .createdAt(Instant.now().minus(45, ChronoUnit.DAYS))
                .build();
        userRepository.save(elena);

        // 3. Marcus Vance (Guitarist & Indie Producer wanting Python)
        List<UserSkill> marcusSkills = new ArrayList<>();
        guitarSkill.ifPresent(s -> marcusSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.TEACH).level(SkillLevel.EXPERT).yearsExp(10)
                .description("Acoustic, fingerpicking, altered tunings (DADGAD), and rhythm guitar masterclasses.")
                .build()));
        musicTheorySkill.ifPresent(s -> marcusSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.TEACH).level(SkillLevel.ADVANCED).yearsExp(8)
                .description("Harmonic progressions, ear training, modes, and practical fretboard navigation.")
                .build()));
        pythonSkill.ifPresent(s -> marcusSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.LEARN).level(SkillLevel.BEGINNER)
                .description("Want to automate audio signal processing scripts and learn web APIs.")
                .build()));

        User marcus = User.builder()
                .email("marcus@example.com")
                .username("marcusv")
                .name("Marcus Vance")
                .passwordHash(defaultPasswordHash)
                .role(Role.USER)
                .status("ACTIVE")
                .bio("Fingerstyle guitarist and indie music producer in Berlin. 10+ years teaching acoustic technique. Eager to master Python for audio scripting!")
                .timezone("Europe/Berlin")
                .languages(List.of("English", "German"))
                .location(UserLocation.builder().city("Berlin").country("Germany").mode(SessionMode.ONLINE).build())
                .availability(List.of(
                        new AvailabilitySlot("TUESDAY", List.of("AFTERNOON", "EVENING")),
                        new AvailabilitySlot("THURSDAY", List.of("EVENING")),
                        new AvailabilitySlot("SATURDAY", List.of("AFTERNOON"))
                ))
                .skills(marcusSkills)
                .reputation(UserReputation.builder()
                        .ratingAverage(5.0)
                        .totalReviews(18)
                        .sessionsCompleted(20)
                        .badges(List.of("Top Teacher", "Guitar Master", "Prompt Swapper"))
                        .build())
                .onboardingCompleted(true)
                .createdAt(Instant.now().minus(60, ChronoUnit.DAYS))
                .build();
        userRepository.save(marcus);

        // 4. Sophia Chen (Product Designer wanting Spanish)
        List<UserSkill> sophiaSkills = new ArrayList<>();
        uiUxSkill.ifPresent(s -> sophiaSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.TEACH).level(SkillLevel.EXPERT).yearsExp(8)
                .description("Design systems, micro-interactions, responsive web & mobile UX, and usability testing.")
                .build()));
        figmaSkill.ifPresent(s -> sophiaSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.TEACH).level(SkillLevel.EXPERT).yearsExp(6)
                .description("Advanced auto-layout, component variants, tokens, and developer handoff.")
                .build()));
        spanishSkill.ifPresent(s -> sophiaSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.LEARN).level(SkillLevel.BEGINNER)
                .description("Conversational practice and vocabulary for upcoming travel in South America.")
                .build()));

        User sophia = User.builder()
                .email("sophia@example.com")
                .username("sophiac")
                .name("Sophia Chen")
                .passwordHash(defaultPasswordHash)
                .role(Role.USER)
                .status("ACTIVE")
                .bio("Principal UX designer in San Francisco. Passionate about Apple-grade minimalism, typography, and design systems. Looking for native Spanish conversation practice!")
                .timezone("America/Los_Angeles")
                .languages(List.of("English", "Mandarin"))
                .location(UserLocation.builder().city("San Francisco").country("United States").mode(SessionMode.ONLINE).build())
                .availability(List.of(
                        new AvailabilitySlot("WEDNESDAY", List.of("EVENING")),
                        new AvailabilitySlot("FRIDAY", List.of("AFTERNOON")),
                        new AvailabilitySlot("SUNDAY", List.of("MORNING"))
                ))
                .skills(sophiaSkills)
                .reputation(UserReputation.builder()
                        .ratingAverage(4.9)
                        .totalReviews(22)
                        .sessionsCompleted(25)
                        .badges(List.of("Top Teacher", "Figma Wizard"))
                        .build())
                .onboardingCompleted(true)
                .createdAt(Instant.now().minus(75, ChronoUnit.DAYS))
                .build();
        userRepository.save(sophia);

        // 5. Carlos Mendez (Native Spanish Instructor wanting UI/UX)
        List<UserSkill> carlosSkills = new ArrayList<>();
        spanishSkill.ifPresent(s -> carlosSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.TEACH).level(SkillLevel.EXPERT).yearsExp(12)
                .description("Native Castilian Spanish, conversational fluency, business Spanish, and grammar refinement.")
                .build()));
        uiUxSkill.ifPresent(s -> carlosSkills.add(UserSkill.builder()
                .skillId(s.getId()).skillName(s.getName()).category(s.getCategory())
                .type(SkillType.LEARN).level(SkillLevel.BEGINNER)
                .description("Want to learn wireframing and user experience principles to build an online community site.")
                .build()));

        User carlos = User.builder()
                .email("carlos@example.com")
                .username("carlosm")
                .name("Carlos Mendez")
                .passwordHash(defaultPasswordHash)
                .role(Role.USER)
                .status("ACTIVE")
                .bio("Native Spanish teacher based in Barcelona. Enthusiastic about language immersion. Learning UI/UX design to launch my educational portal!")
                .timezone("Europe/Madrid")
                .languages(List.of("Spanish", "English", "Catalan"))
                .location(UserLocation.builder().city("Barcelona").country("Spain").mode(SessionMode.ONLINE).build())
                .availability(List.of(
                        new AvailabilitySlot("TUESDAY", List.of("MORNING", "EVENING")),
                        new AvailabilitySlot("THURSDAY", List.of("MORNING")),
                        new AvailabilitySlot("SATURDAY", List.of("AFTERNOON"))
                ))
                .skills(carlosSkills)
                .reputation(UserReputation.builder()
                        .ratingAverage(4.88)
                        .totalReviews(16)
                        .sessionsCompleted(18)
                        .badges(List.of("Language Mentor", "Top Communicator"))
                        .build())
                .onboardingCompleted(true)
                .createdAt(Instant.now().minus(90, ChronoUnit.DAYS))
                .build();
        userRepository.save(carlos);

        // 6. Past Completed Session between Elena and Marcus
        UserSkill elenaPython = elenaSkills.stream().filter(s -> s.getSkillName().equalsIgnoreCase("Python")).findFirst().orElse(null);
        UserSkill marcusGuitar = marcusSkills.stream().filter(s -> s.getSkillName().equalsIgnoreCase("Acoustic Guitar")).findFirst().orElse(null);

        Session pastSession = Session.builder()
                .participantIds(List.of(elena.getId(), marcus.getId()))
                .userAId(elena.getId())
                .userBId(marcus.getId())
                .skillAOffers(elenaPython)
                .skillBOffers(marcusGuitar)
                .startUtc(Instant.now().minus(2, ChronoUnit.DAYS))
                .endUtc(Instant.now().minus(2, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS))
                .mode(SessionMode.ONLINE)
                .meetingLinkOrLocation("https://meet.google.com/ssw-past-demo")
                .status(SessionStatus.COMPLETED)
                .reviewedByUserIds(List.of(elena.getId(), marcus.getId()))
                .completedAt(Instant.now().minus(2, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS))
                .build();
        sessionRepository.save(pastSession);

        // Reviews for past session
        Review reviewForElena = Review.builder()
                .sessionId(pastSession.getId())
                .reviewerId(marcus.getId())
                .revieweeId(elena.getId())
                .rating(5)
                .text("Elena is an incredible instructor! She broke down Python data structures and list comprehensions with total clarity. She even gave me exercises for audio automation.")
                .endorsedSkill("Python")
                .createdAt(Instant.now().minus(2, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS))
                .build();
        reviewRepository.save(reviewForElena);

        Review reviewForMarcus = Review.builder()
                .sessionId(pastSession.getId())
                .reviewerId(elena.getId())
                .revieweeId(marcus.getId())
                .rating(5)
                .text("Marcus was super patient and encouraging. I was able to play my first fingerpicking pattern within 45 minutes! Cannot wait for our next swap.")
                .endorsedSkill("Acoustic Guitar")
                .createdAt(Instant.now().minus(2, ChronoUnit.DAYS).plus(3, ChronoUnit.HOURS))
                .build();
        reviewRepository.save(reviewForMarcus);

        // 7. Upcoming Confirmed Session between Elena and Marcus
        Session upcomingSession = Session.builder()
                .participantIds(List.of(elena.getId(), marcus.getId()))
                .userAId(marcus.getId())
                .userBId(elena.getId())
                .skillAOffers(marcusGuitar)
                .skillBOffers(elenaPython)
                .startUtc(Instant.now().plus(3, ChronoUnit.DAYS).truncatedTo(ChronoUnit.HOURS))
                .endUtc(Instant.now().plus(3, ChronoUnit.DAYS).truncatedTo(ChronoUnit.HOURS).plus(1, ChronoUnit.HOURS))
                .mode(SessionMode.ONLINE)
                .meetingLinkOrLocation("https://meet.google.com/ssw-live-swap")
                .status(SessionStatus.SCHEDULED)
                .build();
        sessionRepository.save(upcomingSession);

        // 8. Pending Swap Request: Sophia -> Carlos
        UserSkill sophiaFigma = sophiaSkills.stream().filter(s -> s.getSkillName().contains("Figma")).findFirst().orElse(null);
        UserSkill carlosSpanish = carlosSkills.stream().filter(s -> s.getSkillName().equalsIgnoreCase("Spanish")).findFirst().orElse(null);

        SwapRequest pendingSwap = SwapRequest.builder()
                .fromUserId(sophia.getId())
                .toUserId(carlos.getId())
                .offeredSkill(sophiaFigma)
                .requestedSkill(carlosSpanish)
                .status(SwapStatus.PENDING)
                .message("Hola Carlos! I saw your profile and would love to exchange Figma design system fundamentals for conversational Spanish. Let me know if you are open to a 1-hour swap this weekend!")
                .proposedSlots(List.of(
                        new ProposedSlot(Instant.now().plus(2, ChronoUnit.DAYS), Instant.now().plus(2, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS), SessionMode.ONLINE, "Online Video")
                ))
                .createdAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .build();
        swapRequestRepository.save(pendingSwap);

        // 9. Conversation & Messages between Elena & Marcus
        Conversation conv = Conversation.builder()
                .participantIds(List.of(elena.getId(), marcus.getId()))
                .lastMessageSenderId(marcus.getId())
                .lastMessageContent("Looking forward to Saturday's session! I prepared tabs for the fingerstyle exercises we talked about.")
                .lastMessageAt(Instant.now().minus(3, ChronoUnit.HOURS))
                .unreadCount(Map.of(elena.getId(), 0, marcus.getId(), 0))
                .createdAt(Instant.now().minus(3, ChronoUnit.DAYS))
                .build();
        conversationRepository.save(conv);

        List<Message> messages = List.of(
                Message.builder()
                        .conversationId(conv.getId())
                        .senderId(elena.getId())
                        .recipientId(marcus.getId())
                        .content("Hi Marcus! Thanks so much for accepting the swap request. Really excited to learn fingerstyle guitar.")
                        .createdAt(Instant.now().minus(3, ChronoUnit.DAYS))
                        .readAt(Instant.now().minus(3, ChronoUnit.DAYS).plus(5, ChronoUnit.MINUTES))
                        .build(),
                Message.builder()
                        .conversationId(conv.getId())
                        .senderId(marcus.getId())
                        .recipientId(elena.getId())
                        .content("Hey Elena! Same here! I've been wanting to dive into Python for audio scripting for months. The first session was a huge help!")
                        .createdAt(Instant.now().minus(2, ChronoUnit.DAYS))
                        .readAt(Instant.now().minus(2, ChronoUnit.DAYS).plus(10, ChronoUnit.MINUTES))
                        .build(),
                Message.builder()
                        .conversationId(conv.getId())
                        .senderId(elena.getId())
                        .recipientId(marcus.getId())
                        .content("I'm practicing the Travis picking pattern every evening. Our next session is scheduled for Saturday at 3 PM UTC.")
                        .createdAt(Instant.now().minus(5, ChronoUnit.HOURS))
                        .readAt(Instant.now().minus(4, ChronoUnit.HOURS))
                        .build(),
                Message.builder()
                        .conversationId(conv.getId())
                        .senderId(marcus.getId())
                        .recipientId(elena.getId())
                        .content("Looking forward to Saturday's session! I prepared tabs for the fingerstyle exercises we talked about.")
                        .createdAt(Instant.now().minus(3, ChronoUnit.HOURS))
                        .readAt(Instant.now().minus(2, ChronoUnit.HOURS))
                        .build()
        );
        messageRepository.saveAll(messages);

        log.info("Demo data seeding completed successfully: 5 users, 2 sessions, 2 reviews, 1 pending swap, 1 conversation with 4 messages.");
    }
}
