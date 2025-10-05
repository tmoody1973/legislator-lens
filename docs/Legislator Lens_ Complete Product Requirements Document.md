# Legislator Lens: Complete Product Requirements Document

**Google Chrome AI Challenge 2025 - Comprehensive Implementation Guide**

---

## Executive Summary

**Legislator Lens** is a revolutionary web application that transforms civic engagement through AI-powered legislative analysis, multimodal interaction, and personalized democratic participation tools. Built with Next.js, Supabase, and Clerk authentication, the application leverages Chrome's built-in AI APIs to provide privacy-first, offline-capable legislative analysis that makes democracy accessible to every citizen.

**Target Categories**: Most Helpful Web Application ($14,000), Best Multimodal AI Application ($9,000), Best Hybrid AI Application ($9,000)

**Core Innovation**: The first civic engagement platform to combine local AI processing with multimodal input, creating an accessible, privacy-preserving tool that empowers citizens to understand complex legislation and take meaningful action.

---

## Problem Statement & Market Opportunity

Congressional legislation remains one of the most significant barriers to civic engagement in modern democracy. Current challenges include dense legal language that requires specialized knowledge to interpret, lack of contextual information connecting bills to real-world impacts, difficulty discovering relevant legislation among thousands of bills, and substantial barriers to effective communication with elected representatives.

Existing solutions like GovTrack and Congress.gov provide raw data but lack the interpretive layer necessary for citizen understanding. Commercial civic engagement platforms often compromise user privacy by processing sensitive political preferences in the cloud, while traditional government transparency tools fail to provide the personalized, actionable insights citizens need to participate effectively in democratic processes.

**Market Opportunity**: Over 240 million eligible voters in the United States represent a massive underserved market for accessible civic engagement tools. Research indicates that 73% of Americans want to be more politically engaged but feel overwhelmed by the complexity of government processes. The introduction of Chrome's built-in AI APIs creates a unique opportunity to solve this problem while maintaining user privacy and providing offline functionality.

---

## Solution Overview & Value Proposition

Legislator Lens addresses these challenges through six core innovations that leverage Chrome's AI capabilities in unprecedented ways.

**AI-Powered Bill Analysis** transforms complex legislation into digestible summaries and visual representations. The application uses Chrome's Summarizer API to create concise overviews while the Prompt API generates key provisions, potential impacts, and stakeholder perspectives. This processing happens entirely on the user's device, ensuring privacy while providing instant analysis.

**Intelligent Categorization System** automatically organizes bills using the Prompt API to analyze content and generate meaningful categories. Unlike traditional policy areas, this system creates dynamic, contextual categories based on bill content and current events, such as "Post-Pandemic Recovery," "Climate Resilience," or "Digital Privacy Rights."

**Multimodal Engagement Features** leverage the Prompt API's image and audio capabilities to create visual impact representations and audio summaries. Users can "see" a bill's potential effects through AI-generated imagery and "hear" testimonials from affected stakeholders, making legislation accessible to different learning styles and abilities.

**Contextual News Integration** connects legislation to real-world coverage through NewsAPI and Guardian API integration, providing citizens with comprehensive context about how bills relate to current events and public discourse. The Summarizer API processes news articles to provide relevant, digestible updates.

**AI-Assisted Letter Writing** empowers citizens to contact representatives through the Writer API, which crafts personalized, persuasive correspondence based on user input and bill analysis. The system supports multimodal input, allowing users to express their views through text, voice recordings, or images of local issues. The Proofreader API ensures professional communication quality.

**Personalized Civic Dashboard** gamifies civic engagement through scoring systems, personalized feeds, and progress tracking that encourages continued participation in democratic processes while maintaining user privacy through local AI processing.

---

## User Research & Personas

### Primary Persona: Sarah - The Concerned Citizen
**Demographics**: 34-year-old teacher, moderate political engagement, primarily mobile user
**Goals**: Stay informed about education policy, understand how legislation affects her students, participate meaningfully in democracy without overwhelming time commitment
**Pain Points**: Limited time for political research, complex legal language, uncertainty about which bills matter most, intimidation about contacting representatives
**Tech Comfort**: Moderate, appreciates intuitive interfaces and clear guidance
**Civic Engagement**: Votes regularly, occasionally shares political content, wants to do more but lacks accessible tools

### Secondary Persona: Marcus - The Civic Activist
**Demographics**: 28-year-old nonprofit worker, high political engagement, uses desktop and mobile equally
**Goals**: Deep policy analysis, coordinate advocacy efforts, track legislative progress across multiple issues, influence policy outcomes
**Pain Points**: Information scattered across multiple sources, time-consuming research processes, difficulty organizing advocacy efforts
**Tech Comfort**: High, wants advanced features and customization options
**Civic Engagement**: Highly active, contacts representatives regularly, organizes community advocacy

### Tertiary Persona: Elena - The New American
**Demographics**: 45-year-old recent citizen, learning democratic processes, primarily mobile user
**Goals**: Understand how government works, learn to participate effectively, overcome language and cultural barriers
**Pain Points**: Complex systems, occasional language barriers, intimidated by political processes, unfamiliar with advocacy norms
**Tech Comfort**: Basic, needs guidance and support throughout the process
**Civic Engagement**: Eager to participate but needs accessible entry points and cultural context

---

## Technical Architecture & Implementation

### Core Technology Stack

The application employs a modern, scalable architecture designed for performance, accessibility, and seamless Chrome AI integration.

**Frontend Framework**: Next.js 14 with App Router provides server-side rendering, optimal performance, and seamless Chrome AI API integration. The framework's built-in optimization features ensure fast loading times and smooth user interactions across all devices.

**Database & Backend**: Supabase offers real-time database capabilities, authentication integration, and edge functions for API orchestration. The platform's PostgreSQL foundation provides robust data management for user profiles, bill analysis cache, and engagement tracking while supporting real-time updates for collaborative features.

**Authentication**: Clerk provides secure, user-friendly authentication with social login options and comprehensive user management features. Integration with Supabase ensures seamless data access control and personalization while maintaining privacy standards.

**Styling & Design**: Tailwind CSS with a custom design system creates a clean, accessible interface that works across all devices and screen sizes. The Bento-style layout system provides visual hierarchy and intuitive navigation.

### Chrome AI API Integration Strategy

Each Chrome AI API serves specific purposes within the application architecture, maximizing the unique advantages of local processing while providing powerful functionality.

| API | Primary Use Cases | Implementation Details | Privacy Benefits |
|-----|------------------|----------------------|------------------|
| **Prompt API (Multimodal)** | Bill analysis, categorization, image generation, audio processing | Processes bill text to extract insights, generates visual representations, analyzes voice input | All analysis stays on device |
| **Summarizer API** | Bill summaries, news article condensation | Creates digestible overviews of complex legislation and related coverage | No sensitive data transmitted |
| **Writer API** | Letter generation, testimonial creation | Crafts personalized correspondence and stakeholder perspectives | Personal views remain private |
| **Rewriter API** | Content optimization, alternative explanations | Improves clarity and provides multiple explanation styles | Local processing ensures privacy |
| **Proofreader API** | Letter quality assurance | Ensures professional quality of user correspondence | Grammar checking stays local |
| **Translator API** | Multilingual accessibility | Provides legislation access in multiple languages | Language preferences private |

### Data Architecture & Privacy Design

The application manages several key data entities while prioritizing user privacy and local processing capabilities.

**Bills Collection** stores congressional legislation metadata, full text when available, AI-generated summaries, categories, and analysis results. The system intelligently caches AI processing results to improve performance and reduce redundant API calls while ensuring fresh analysis for updated legislation.

**Users Collection** maintains user profiles, preferences, civic scores, engagement history, and personalized category interests. Privacy-first design ensures sensitive political preferences and personal information remain on-device when possible, with only anonymized engagement metrics stored in the cloud.

**News Articles Collection** aggregates related news coverage, AI-generated summaries, and relevance scores to provide contextual information about legislation. Articles are processed locally to extract relevant information while maintaining user privacy about reading habits.

**Letters Collection** tracks user correspondence with representatives, templates, and engagement metrics to measure civic participation impact. Personal letter content is processed locally, with only anonymized effectiveness metrics shared for system improvement.

---

## Complete User Experience Design

### Design Principles & Accessibility

**Accessibility First** ensures the interface works for users with different abilities, learning styles, and technical comfort levels. Every AI-powered feature includes multiple interaction modes (text, voice, visual) to accommodate diverse user needs, with full WCAG 2.1 AA compliance across all features.

**Progressive Disclosure** reveals complexity gradually, allowing new users to start with simple bill browsing while advanced users can access detailed analysis tools and civic engagement features. The interface adapts to user expertise and engagement levels over time.

**Privacy Transparency** makes AI processing visible and controllable, showing users when data stays local versus when hybrid cloud processing provides enhanced features. Clear indicators help users understand and control their privacy preferences.

**Civic Empowerment** transforms passive information consumption into active democratic participation through clear calls-to-action, guided engagement pathways, and meaningful feedback about civic impact.

### Complete User Journey Mapping

#### Phase 1: Discovery & Onboarding Experience

**Landing Page Experience** welcomes users with a clean, professional interface that immediately communicates value through social proof and interactive demonstrations. The hero section features live counters showing "Bills Analyzed Today" and "Citizens Engaged," creating urgency and credibility. A prominent search bar invites immediate exploration with contextual placeholder text.

The **AI-Powered Demo** showcases capabilities without requiring signup, allowing users to experience a sample bill analysis that demonstrates the Summarizer API creating clear overviews, the Prompt API extracting key provisions, and the visual impact generator creating compelling imagery. This 30-second experience proves value before commitment.

**Smart Onboarding Flow** guides new users through personalization without overwhelming them. Step one presents visually appealing category cards generated by the Prompt API's analysis of current legislation, allowing users to select 3-5 topics of interest. Step two asks users to choose their preferred engagement level, from staying informed to taking action to deep policy analysis. Step three establishes communication preferences and notification settings. Step four uses browser geolocation or manual zip code entry to identify representatives automatically.

#### Phase 2: Core Discovery Experience

**Personalized Dashboard** employs a Bento-style layout with distinct, card-based sections that create visual hierarchy and enable easy scanning. The hero card features the most relevant bill for the user based on their interests, complete with AI-generated summary, visual impact representation, and clear action buttons.

The **Trending Bills Section** displays 3-4 bills gaining attention through news coverage and social engagement, with preview cards showing titles, category tags, and engagement indicators. The **Civic Score Widget** presents gamification elements in an engaging but professional manner, showing points earned, current streak, and next achievement milestone.

**Bill Discovery Interface** combines traditional keyword search with AI-powered semantic understanding. As users type, the Prompt API suggests related terms and concepts, helping users discover relevant legislation they might not have known to search for. Dynamic filtering allows users to sort by AI-generated categories, impact level, action stage, and engagement metrics.

#### Phase 3: Deep Bill Analysis Experience

**Bill Analysis Page Layout** provides comprehensive information in an organized, scannable format. The header section displays essential bill information including title, number, status, sponsor details with photos, and timeline information. Social sharing and save functionality encourage engagement and return visits.

**AI Analysis Tabs** organize complex information into digestible sections. "The Gist" tab uses the Summarizer API to create 2-3 paragraph overviews explaining the bill's purpose, main provisions, and potential impact in plain language. "Key Provisions" presents the Prompt API's extraction of important sections as expandable cards with plain language explanations and impact assessments.

The **Visual Impact Tab** showcases multimodal AI capabilities with generated imagery representing the bill's potential effects. Users can request different perspectives (economic, social, environmental) to see varied visual representations. The **Stakeholder Voices Tab** features AI-generated testimonials from different perspectives, created by the Writer API and available as audio through text-to-speech conversion.

**Interactive Q&A Feature** allows users to ask specific questions about bills using natural language. The Prompt API processes queries like "How would this affect small businesses?" and provides contextual answers based on the bill's content, creating a conversational learning experience.

#### Phase 4: Civic Engagement Actions

**Letter Writing Assistant** accommodates different user preferences and abilities through multimodal input options. Text input provides traditional typing with real-time AI assistance from the Writer API. Voice input allows users to speak their thoughts, with the Prompt API's multimodal capabilities transcribing and structuring ideas into coherent arguments. Image input enables users to upload photos of local issues related to the legislation, with AI analysis generating relevant talking points.

The **Guided Writing Process** walks users through effective advocacy in five steps: position selection with AI explanation of implications, personal story integration with Writer API assistance, key points selection from AI-generated talking points, tone customization with Rewriter API adaptation, and quality review using the Proofreader API for professional presentation.

**Representative Contact Interface** automatically identifies appropriate recipients based on bill jurisdiction and user location, displaying representative photos, basic information, positions on similar legislation, and preferred contact methods. Delivery options include direct platform sending, formatted text copying, PDF generation, and social media post creation.

#### Phase 5: Community & Gamification

**Civic Score Dashboard** visualizes user engagement across multiple dimensions including knowledge points for bill reading, action points for representative contact, community points for helpful contributions, and streak tracking for consistent engagement. The achievement system recognizes different participation types from first steps to expertise to community contribution.

**Social Features** maintain privacy while enabling community engagement through anonymous discussions moderated by the Prompt API, bill impact stories for emotional connection, and action coordination for users with shared interests.

### Mobile-First Responsive Design

**Mobile Experience Optimization** ensures thumb-friendly navigation with all interactive elements positioned for comfortable one-handed use. Progressive loading displays essential information first, with detailed analysis loading as users scroll or request it. Voice-first features emphasize audio input and output, recognizing that mobile users often multitask while consuming political content.

**Offline Capabilities** leverage Chrome's local AI processing to maintain core functionality even with poor connectivity, crucial for users in areas with limited internet access. The application gracefully handles network interruptions while preserving user progress and maintaining engagement.

---

## Feature Specifications & Chrome AI Integration

### 1. Intelligent Bill Discovery & Categorization

**Smart Categories System** represents the most innovative use of the Prompt API for content organization. The system analyzes bill content, current events, and user engagement patterns to create dynamic categories that go beyond traditional policy areas. Categories like "Post-Pandemic Recovery," "Climate Resilience," or "Digital Privacy Rights" emerge organically from legislative content analysis.

The categorization process involves multiple AI analysis steps. The Summarizer API creates concise bill overviews, which the Prompt API then analyzes alongside bill metadata to generate primary and secondary categories. The system identifies cross-cutting themes and potential stakeholder impacts, creating a rich taxonomy that helps users discover relevant legislation.

**Personalized Feed Algorithm** combines user interests with AI-generated categories to create customized legislative feeds. The system learns from user engagement patterns, adjusting recommendations based on reading time, sharing behavior, and action-taking frequency. Machine learning models running locally ensure personalization without compromising privacy.

### 2. Multimodal Bill Analysis

**Visual Impact Generator** represents the most innovative application of Chrome's multimodal capabilities. When analyzing a bill, the system uses the Prompt API to generate descriptive prompts for visual representations of legislative impact. The process involves creating detailed descriptions of potential outcomes, then generating compelling imagery that helps users understand abstract policy concepts.

Implementation involves multiple coordinated steps: the Summarizer API creates bill overviews, the Prompt API identifies key impact areas and generates visual descriptions, and the multimodal capabilities create imagery that resonates emotionally with users while remaining factually grounded.

**Audio Accessibility Features** make legislation accessible to users with different learning preferences and abilities. The system generates audio summaries using text-to-speech technology and creates simulated stakeholder testimonials through the Writer API, then converts them to audio format for comprehensive accessibility.

### 3. AI-Powered Letter Writing Assistant

**Multimodal Input Processing** allows users to express their views through text, voice, or images, with the Prompt API's multimodal capabilities processing each input type appropriately. Voice recordings are transcribed and structured into coherent arguments, while images of local issues generate relevant talking points and policy connections.

**Intelligent Letter Crafting** uses the Writer API to transform user input into professional, persuasive correspondence. The system considers the specific bill, user's position, representative's background, and effective advocacy principles to create targeted messaging that maximizes impact potential.

**Quality Assurance Pipeline** employs multiple AI systems to ensure professional presentation. The Proofreader API handles grammar and spelling, while the Rewriter API offers alternative phrasings and approaches. The system provides real-time feedback on clarity, persuasiveness, and professional tone.

### 4. Contextual News Integration

**Related News Discovery** connects bills to current events through NewsAPI and Guardian API integration, with the Summarizer API processing articles to create concise, relevant overviews. The system maintains user privacy by processing news content locally while providing comprehensive context.

**News Relevance Scoring** employs the Prompt API to analyze how closely news articles relate to specific legislation, ensuring users receive the most pertinent contextual information. The system considers topic overlap, stakeholder mentions, and temporal relevance to create meaningful connections.

### 5. Privacy-First Gamification

**Civic Score System** tracks user engagement across multiple dimensions while maintaining privacy through local processing. The system awards points for knowledge acquisition, action-taking, community contribution, and consistent engagement, creating motivation without compromising sensitive political preferences.

**Achievement System** recognizes different types of civic engagement through badges and milestones that encourage continued participation. The system balances motivation with professionalism, avoiding childish gamification while maintaining engagement effectiveness.

---

## Implementation Roadmap & Development Guide

### Phase 1: Foundation & Core Setup (Weeks 1-2)

**Development Environment Initialization** involves setting up the Next.js 14 project with TypeScript configuration, establishing Supabase integration with proper database schema design, configuring Clerk authentication with social login options, and creating the basic project structure with component organization.

**Congress.gov API Integration** focuses on establishing reliable connections to congressional data sources, implementing bill fetching with full-text filtering to ensure quality user experiences, creating data validation and error handling systems, and establishing caching strategies for performance optimization.

**Basic UI Framework Development** includes implementing the design system with Tailwind CSS, creating responsive layout components with Bento-style organization, establishing navigation patterns and user interface consistency, and ensuring accessibility compliance from the foundation level.

### Phase 2: Chrome AI Integration (Weeks 3-4)

**Core AI API Implementation** systematically integrates each Chrome AI API, starting with the Summarizer API for bill overviews, adding Prompt API for categorization and analysis, implementing Writer API for letter assistance, and establishing error handling and fallback systems.

**Bill Analysis Pipeline Development** creates the automated processing system that transforms raw congressional data into user-friendly insights, implements confidence scoring and quality indicators, establishes processing queues for performance optimization, and creates user feedback mechanisms for continuous improvement.

**User Interface Enhancement** builds the bill discovery interface with search and filtering capabilities, creates analysis display components with tabbed organization, implements user dashboard with personalization features, and ensures mobile responsiveness across all components.

### Phase 3: Advanced Features & Multimodal Capabilities (Weeks 5-6)

**Multimodal Feature Implementation** develops visual impact generation using the Prompt API's image capabilities, creates audio summary systems with text-to-speech integration, implements voice input processing for letter writing, and establishes quality assurance for AI-generated content.

**News Integration Development** connects external news APIs with relevance scoring systems, implements article summarization and contextual display, creates timeline visualization for legislative coverage, and establishes update mechanisms for fresh content.

**Letter Writing System Creation** develops the comprehensive AI-assisted correspondence feature with multimodal input processing, implements representative matching and contact systems, creates quality assurance pipelines with multiple AI systems, and establishes delivery and tracking mechanisms.

### Phase 4: Personalization & Community Features (Weeks 7-8)

**Civic Engagement System Implementation** creates the scoring and achievement systems with privacy-first design, implements personalized feed algorithms with local processing, develops community features with anonymous participation options, and establishes progress tracking and motivation systems.

**Performance Optimization & Testing** conducts comprehensive testing across devices and browsers, optimizes AI processing performance and user experience, implements accessibility testing and compliance verification, and prepares production deployment with monitoring systems.

**Submission Preparation** creates demonstration videos showcasing key features and innovations, writes comprehensive documentation and submission materials, prepares GitHub repository with clear instructions and licensing, and conducts final testing and quality assurance.

---

## Success Metrics & Evaluation Criteria

### User Engagement Metrics

**Active User Retention** measures how effectively the application maintains user interest over time, targeting 60% weekly retention among registered users through compelling content and meaningful civic engagement opportunities.

**Civic Action Conversion** tracks the percentage of users who progress from passive consumption to active participation, aiming for 15% conversion rate from bill reading to representative contact, demonstrating the application's effectiveness in promoting democratic engagement.

**Content Consumption Depth** monitors how thoroughly users engage with bill analyses and related features, targeting average session duration of 8+ minutes and multiple bill analyses per visit, indicating genuine learning and engagement rather than superficial browsing.

### Technical Performance Metrics

**AI Processing Speed** ensures bill analysis completes within 10 seconds for optimal user experience, leveraging Chrome's local processing capabilities for immediate feedback and engagement maintenance.

**Offline Functionality** maintains core features when internet connectivity is limited, demonstrating the advantages of Chrome's built-in AI processing for consistent user experience regardless of network conditions.

**Cross-Platform Compatibility** ensures consistent experience across desktop and mobile devices, with responsive design and feature parity that serves users regardless of their preferred interaction method.

### Impact & Civic Engagement Metrics

**Legislative Awareness Improvement** measures user knowledge enhancement through pre/post engagement surveys, targeting measurable increases in understanding of legislative processes and specific bill comprehension.

**Political Efficacy Enhancement** tracks user confidence in their ability to influence government decisions and participate meaningfully in democratic processes, measuring the application's success in empowering civic engagement.

**Representative Contact Frequency** monitors increases in user communication with elected officials, measuring the application's effectiveness in facilitating meaningful democratic participation and government accountability.

---

## Competitive Advantages & Market Differentiation

**Privacy-First AI Processing** differentiates Legislator Lens from cloud-dependent competitors by keeping sensitive user data on-device while providing powerful AI features. This approach addresses growing privacy concerns while enabling personalized experiences that traditional civic engagement platforms cannot match.

**Multimodal Accessibility** makes legislation accessible to users with different learning styles and abilities, expanding the potential user base beyond traditional civic engagement platforms. The combination of text, voice, and visual processing creates inclusive experiences that serve diverse communities.

**Real-Time Contextual Information** provides comprehensive understanding by connecting legislation to current events and public discourse, offering depth and context that raw government data sources cannot provide while maintaining user privacy and local processing advantages.

**Gamified Civic Engagement** transforms traditionally dry political content into engaging, rewarding experiences that encourage sustained participation. The professional approach to gamification maintains credibility while providing motivation for continued civic engagement.

**Beginner-Friendly Implementation** using Claude Code makes the development process accessible while maintaining professional quality standards, enabling rapid iteration and feature development within hackathon constraints.

---

## Risk Mitigation & Contingency Planning

**API Rate Limiting Management** addresses potential constraints through intelligent caching systems, request batching for efficiency, graceful degradation when limits are reached, and user communication about temporary limitations while maintaining core functionality.

**Data Quality Assurance** manages potential issues through multiple validation layers, user feedback systems for continuous improvement, continuous monitoring of AI-generated content accuracy, and fallback systems when automated analysis fails.

**User Adoption Strategy** mitigates potential challenges through intuitive onboarding processes, clear value propositions with immediate benefits, progressive feature introduction to avoid overwhelming new users, and community building to encourage sustained engagement.

**Technical Complexity Management** addresses development challenges through modular architecture design, comprehensive testing protocols, Claude Code assistance for implementation guidance, and documentation systems that support ongoing development and maintenance.

---

## Conclusion & Strategic Vision

Legislator Lens represents a transformative approach to civic engagement that leverages Chrome's cutting-edge AI capabilities to make democracy more accessible, engaging, and effective for all citizens. By combining privacy-first AI processing with innovative multimodal features and comprehensive legislative analysis, the application addresses fundamental barriers to civic participation while showcasing the full potential of Chrome's built-in AI APIs.

The project's strategic use of hybrid AI architecture, comprehensive feature set, and focus on user empowerment positions it as a strong contender for multiple prize categories in the Google Chrome AI Challenge 2025. The combination of technical innovation, user-centered design, and genuine civic impact creates a compelling solution that demonstrates how AI can enhance democratic participation while maintaining user privacy and providing authentic value.

Through careful implementation of the outlined roadmap, comprehensive user experience design, and strategic use of Chrome's AI capabilities, Legislator Lens will demonstrate the transformative potential of accessible civic technology. The application serves not only as a hackathon submission but as a proof of concept for how AI can strengthen democratic institutions and empower citizen participation in the digital age.

The detailed specifications, user research, technical architecture, and implementation guidance provided in this document create a comprehensive foundation for building a winning hackathon submission that could evolve into a meaningful tool for democratic engagement and civic empowerment.

---

## References & Resources

[1] Congress.gov API Documentation: https://api.congress.gov/
[2] Chrome Built-in AI APIs: https://developer.chrome.com/docs/ai/built-in
[3] NewsAPI Documentation: https://newsapi.org/docs
[4] Guardian Open Platform: https://open-platform.theguardian.com/
[5] Next.js Documentation: https://nextjs.org/docs
[6] Supabase Documentation: https://supabase.com/docs
[7] Clerk Authentication: https://clerk.com/docs
[8] Web Content Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
[9] Chrome AI Challenge 2025: https://googlechromeai2025.devpost.com/
