Of course. When a system crashes and context is lost, the only way forward is to re-establish a source of truth that is absolute, comprehensive, and undeniable. This document is engineered for that exact purpose. It is a synthesis of every piece of insight, every feature request, every frustration, and every visionary spark you have provided.

This is not just a list of requirements; it is a complete, context-rich guide designed to be the foundational document for the entire Arboracle platform. It is the architectural blueprint for the present and the unwavering manifesto for the agent-driven future.

---

# Arboracle: Product Requirements Document (PRD)

**Version:** 2.0 (Agent Swarm Edition)  
**Date:** July 3, 2025  
**Status:** MASTER DOCUMENT - SINGLE SOURCE OF TRUTH

## 1. The Vision & Guiding Philosophy

### 1.1. Our Manifesto: The Future of Eco-Intelligence
Arboracle is not just another app. It is the nervous system for a new era of ecological stewardship. Its destiny is to become a decentralized swarm of intelligent AI agents—a true partner for every professional managing our planet's green spaces. Every feature we build, every line of code we write, must serve this singular vision. The future of Arboracle is voice-first, AI-driven, and seamlessly integrated into the workflows of those on the ground.

### 1.2. The Design Ethos: Nature-Aligned Wisdom
We reject sterile, rigid interfaces. Our aesthetic must be **"super smooth and full of nature-aligned wisdom."**

*   **Organic & Fluid:** Embrace gentle curves, soft gradients, and flowing transitions. Elements should feel naturally "grown," not constructed.
*   **Sophisticated & Trustworthy:** Use a muted, earthy color palette (sage, moss, terracotta accents) and clean, professional typography. The UI must inspire confidence.
*   **Subtle Dynamism:** Incorporate micro-animations that mimic natural phenomena (gentle sways, soft blooms, ripples). Feedback should be felt, not just seen.

### 1.3. The Product Principle: A Minimum Lovable Product (MLP)
We build beyond viability. Arboracle must be **lovable**. This means it delivers:

*   **Emotional Connection:** A beautiful design and intuitive workflows that professionals are proud to use.
*   **Immediate Value:** Day-one utility that makes an arborist's job easier, faster, and more accurate.
*   **Aspirational Quality:** It represents the future of the industry, making users feel they are part of a movement.

## 2. Target Audience & User Personas

1.  **The Professional Field Arborist:** Manages urban and commercial trees. Needs fast, accurate, field-ready tools. Values efficiency, standardized data, and professional reporting.
2.  **The Construction Site Monitor:** A specialized arborist overseeing tree preservation on development sites. Requires structured, repeatable checklists for compliance reporting (e.g., TPZ/CRZ status).
3.  **The Forestry Student / Certification Candidate:** Studying to become a certified arborist. Needs an integrated platform that connects academic knowledge with real-world application.
4.  **The Nursery Owner:** Manages tree inventory and supplies stock for large-scale projects. Needs inventory management tools and a direct sales/quoting channel to forestry professionals.

## 3. The Grand Architecture: Agent-First & Asynchronous

Every implementation detail must align with our future as an agent swarm.

| Principle                    | Requirement                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent-Ready APIs**         | Every discrete data point (e.g., a single DBH value, a TPZ Fencing status) must be accessible and modifiable via a granular, stateless API endpoint. Design for atomic updates.             |
| **Voice-First Data**         | Backend services must be architected to parse natural language intent (e.g., "Note minor root severance on the heritage oak") and map it to our structured database schema.               |
| **Asynchronous Operations**  | All long-running tasks (report generation, photo uploads, data syncs) MUST be background jobs. The UI must remain responsive and update upon completion without blocking the user.      |
| **Extensible AI Identity**   | AI Personalities (Bodhi, Sequoia, etc.) must be modular, swappable components. Adding a new agent should be a configuration change, not a code change.                                  |

## 4. Functional Requirements: The Platform Blueprint

### 4.1. Core Application & Dashboard
*   **User Story:** As a professional, I want to log in to a clean, branded dashboard that gives me an immediate, high-level overview of my inventory and a clear path to my most common tasks.
*   **Requirements:**
    1.  **Branding:** Prominent Arboracle logo (🌳 emoji + "Arboracle" wordmark).
    2.  **Stats Cards:** Display key metrics: Total Trees, Species Diversity, Forest Health Score, etc. **These must be functional and pull real data.**
    3.  **Navigation:** Persistent sidebar/header with clear links to: `Dashboard`, `My Trees`, `Map`, `Learn`, `Know`, `Config`, `Admin`. Active state must be clearly indicated.
    4.  **Call to Action (CTA):** Large, prominent "Add New Tree" button.

### 4.2. Tree Inventory: List & Detail Views
*   **User Story:** As an arborist, I need to see a searchable list of all my trees and be able to drill down into a comprehensive, editable detail view for any single tree.
*   **Requirements:**
    1.  **List View:**
        *   Display a card/row for each tree with essential info: Species, Common Name, Status (e.g., Verified), and Key Measurement (e.g., DBH).
        *   Implement a **real-time search bar** to filter by species or common name.
        *   Implement **filter controls** by Status (e.g., All, Verified, Pending).
        *   **CRITICAL FIX:** Ensure this page scrolls smoothly and loads efficiently, even with hundreds of trees.
    2.  **Detail View:**
        *   Accessible by clicking a tree in the list view.
        *   **CRITICAL FIX:** The entire view must be scrollable on all devices. No fixed panes.
        *   Organize information using clean tabs: `Info`, `Manage`, `Eco`, `Science`.
        *   Display all captured tree data in a readable format.
        *   Provide clear `Edit` and `Back` navigation. The pencil icon at the top is the primary entry point to the edit form.

### 4.3. The Tree Form: Adding & Editing Trees
*   **User Story:** As an arborist in the field, I need a comprehensive yet efficient form to capture all industry-standard data for a new or existing tree.
*   **Requirements:**
    1.  **Tree Details (Section):**
        *   `Species (Required)`: Text input with **iNaturalist API-powered auto-completion**.
        *   `Common Name`: Text input.
        *   `General Notes`: Text area for miscellaneous notes.
    2.  **Location Information (Section):**
        *   `Latitude & Longitude (Required)`: Auto-populated or manually entered. Must be a **clickable link** opening an external map.
        *   `[Get Current GPS] Button`: Captures device location.
        *   `[Pick on Map] Button`: Opens a **full-screen interactive map** to place a pin.
        *   `Generated Plus Code (Global & Local)`: Auto-generated from coordinates. Must be a **clickable link**.
    3.  **Tree Measurements (Section):**
        *   `Height`: Number input (unit determined by user settings).
        *   `DBH (Diameter at Breast Height) (in/cm)`: Number input.
        *   `Multi-stem tree?` (Checkbox):
            *   If checked, displays `Individual Stem Diameters (in)` text field.
            *   **Auto-calculates** and updates the primary DBH field using the ISA formula: `sqrt(d1² + d2² + ...)`.
        *   `Canopy Spread N-S (ft)` and `Canopy Spread E-W (ft)`: Number inputs.
    4.  **Management Data (Section - "Professional"):**
        *   **CRITICAL FIX:** This section's functionality is paramount for our professional users.
        *   `Project Association (Required Dropdown)`: A list of all created projects from the Admin panel.
        *   **Professional Condition Assessment (Clickable Accordion):**
            *   Each section (Structure, Canopy Health, Pests & Diseases, Site Conditions) must be a collapsible accordion.
            *   Inside each section, every item (e.g., "Co-dominant stems," "Leaf discoloration") is a **checklist item**.
            *   **Crucially**, when an item is checked, an optional `Add specific notes...` text field appears directly beneath it.
            *   **The "Fulcrum Model" label must be removed.**
        *   `"Willow Knows" AI Insights`: This card displays dynamic, context-aware information based on the selected assessment items. (e.g., if "Soil Compaction" is checked, it displays info on root growth limitation and links to a knowledge base article).
        *   `Management Actions`: Comma-separated text input.
    5.  **Media Upload:**
        *   **CRITICAL FIX:** Ensure the `[Camera]` and `[Gallery]` buttons successfully upload images. Uploaded images must appear as thumbnails within the form and be persistently saved with the tree record upon saving. Resolve the "Upload failed" error.

### 4.4. Interactive Map View
*   **User Story:** As a project manager, I need a mission control center to visualize my entire tree inventory, assess spatial relationships, and use advanced overlays for deeper analysis.
*   **Requirements:**
    1.  **Map Engine:** Use a robust, high-performance engine (Google Maps, Mapbox). **Must provide high-resolution satellite imagery.**
    2.  **Controls:** Implement functional UI controls for `Zoom In/Out`, `Toggle Satellite/Street View`, and `Find My Location`.
    3.  **Markers:** Tree locations must be represented by **dynamic icons** that change based on age (sprout -> sapling -> mature tree).
    4.  **Interactivity:** Clicking a marker must open a clean pop-up with key tree details and a link to the full "Detail View."
    5.  **Future-Proof for Overlays:** The architecture must support the addition of analytical data layers (e.g., from SkyFi API).

### 4.5. Specialized Professional Module: Construction Monitoring
*   **User Story:** As a construction site arborist, I need a dedicated form template for my specific, recurring monitoring tasks, and I want to organize all these reports under a single 'Project'.
*   **Requirements:**
    1.  **"Projects" Feature:** Must be creatable in the Admin Panel. Each project will have a name, address, and client.
    2.  **"Assessment Types":** When adding a new assessment to a tree, the user must choose between `Standard` and `Construction Monitoring`.
    3.  **Dedicated Form Template:** The "Construction Monitoring" form will include specialized, dropdown-heavy fields:
        *   `TPZ Fencing`: Options like "Good condition," "Not installed," etc.
        *   `TPZ Incursions`: Options like "None," "Excessive," etc.
        *   `CRZ Impacts`: A multi-select checklist for `Root severance`, `Soil Compaction`, etc.
        *   And all other fields as specified in the "Sprint VII" brief.
    4.  **Printable PDF Reports:** An "Export to PDF" function must generate a professional, client-ready report from a specific Construction Monitoring assessment, including all selected options, narrative notes, and photo thumbnails.

## 5. Non-Functional Requirements

*   **Technology Stack:** Next.js with TypeScript.
*   **Performance:** The platform must be fast and responsive, especially on mobile devices in the field. Initial page load should be under 3 seconds. Map interactions must be fluid.
*   **Scalability:** Built on a cloud-native architecture (e.g., Vercel, Fly.io) that can scale to handle millions of records and thousands of concurrent users.
*   **Security:** Standard security practices must be in place (e.g., data sanitization, secure API endpoints).
*   **Accessibility:** UI must adhere to WCAG 2.1 AA standards for color contrast, keyboard navigation, and screen reader compatibility.

## 6. Future Roadmap Summary

This PRD establishes the solid foundation upon which we will build the future of Arboracle. The next phases include:

*   **Live Deployment & Field Testing:** Pushing to production, enabling real-world GPS and photo capture.
*   **AI Model Training:** Using the collected structured data to train the Forest Health Score and "Willow Knows" models.
*   **Native Mobile Apps:** Developing dedicated iOS and Android apps for the ultimate field experience.
*   **STIM Integration:** Fully implementing the Stasis Through Inferred Memory framework for predictive, adaptive ecosystem management.

## 7. Glossary of Key Terms

*   **Biomimetic:** Design and architecture inspired by the intelligence of natural systems, particularly forests.
*   **DBH:** Diameter at Breast Height. A standard arboricultural measurement.
*   **MLP:** Minimum Lovable Product. A product that users love, not just tolerate.
*   **Plus Code:** A Google-developed geocode system for identifying any area on Earth.
*   **STIM:** Scientific Tree Intelligence Model. Arboracle's proprietary AI framework.
*   **TPZ / CRZ:** Tree Protection Zone / Critical Root Zone. Key areas to protect during construction.

---
This document is the **single source of truth.** Refer to it to resolve any ambiguity. If it is not in this document, it is not in the scope of this rebuild. Let's build with precision, passion, and a clear vision for the revolutionary future we are creating.
