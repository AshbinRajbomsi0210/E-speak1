# AI Assistant Features Documentation

> **Location:** `frontend/src/pages/report-issue/components/AIAssistant.jsx`  
> **Purpose:** Intelligent assistance for users reporting civic issues

---

## Overview

The AI Assistant provides real-time intelligent suggestions while users fill out the issue report form. All features are triggered automatically based on user input with a **2-second debounce** to optimize performance.

---

## Feature Trigger Flow

```
User Types in Form Fields
         ↓
   2-second debounce
         ↓
   AI Analysis Starts
         ↓
┌────────┴────────┬─────────────────┬──────────────────┐
↓                 ↓                 ↓                  ↓
Duplicate      Category &       Title            AI Insights
Detection      Priority       Enhancement        (RAG Query)
               Suggestions
```

---

## 1. Duplicate Detection 🔍

### Purpose
Prevents duplicate reports for the same issue, helping authorities focus on unique problems and avoid redundant work.

### Trigger Conditions

| Field | Condition |
|-------|-----------|
| **Title** | Contains keyword `"pothole"` |
| **Description** | Contains keyword `"road damage"` |

### Activation
- Triggered after **2-second debounce** when user stops typing
- Requires either title OR description to contain trigger keywords

### Output
When a potential duplicate is found, displays:
- **Similar Report Title** - Title of the existing report
- **Similarity Percentage** - How closely it matches (e.g., 94%, 76%)
- **Report ID** - Reference number (e.g., `RPT-2025-1108-001`)
- **Reported Date** - When the original was submitted
- **Current Status** - Under Review, In Progress, Resolved, etc.

### Example
```
⚠️ Potential Duplicate Detected

Similar Report: "Large pothole on Main Street causing vehicle damage"
Similarity: 94%
Report ID: RPT-2025-1108-001
Reported: November 8, 2025
Status: Under Review
```

---

## 2. Title Enhancement ✨

### Purpose
Creates more descriptive, attention-grabbing titles that help officials prioritize and respond to issues faster.

### Trigger Conditions
- **Title** must have at least **5 characters**
- **Description** must be filled
- Triggered after **2-second debounce**

### Enhancement Rules

| Keyword in Description | Enhancement Applied | Example |
|------------------------|---------------------|---------|
| `noise` | Adds "Noise Issue: " prefix | "Loud music" → "Noise Issue: Loud music" |
| `pothole` | Adds "Large " prefix | "Pothole on road" → "Large Pothole on road" |
| `garbage` | Adds "Uncollected Garbage: " prefix | "Trash piling up" → "Uncollected Garbage: Trash piling up" |
| `trash` | Adds "Overflowing " prefix | "Trash bin full" → "Overflowing Trash bin full" |
| `broken` | Replaces with "Damaged" | "Broken bench" → "Damaged bench" |
| `light` + `street` | Adds "Broken Street Light: " prefix | "Light not working" → "Broken Street Light: Light not working" |
| `water leak` | Adds "Water Leak: " prefix | "Pipe issue" → "Water Leak: Pipe issue" |
| `graffiti` | Adds "Graffiti: " prefix | "Wall vandalized" → "Graffiti: Wall vandalized" |
| `dangerous` or `emergency` | Adds "Urgent: " prefix | "Fallen tree" → "Urgent: Fallen tree" |
| Street name detected | Appends "on [Street Name]" | "Pothole" → "Pothole on Main Street" |

### Constraints
- Enhanced title must not exceed **80 characters**
- Only the **first matching improvement** is applied
- Displays with **85% confidence** score

### Output
```
✨ Enhanced Title Suggestion

Original: "Pothole on road"
Suggested: "Large Pothole on Main Street"
Confidence: 85%

Benefit: Clear titles help officials prioritize and respond faster
```

---

## 3. Category Suggestion 📁

### Purpose
Routes reports to the correct department faster by automatically detecting the issue type.

### Trigger Conditions

| Keyword in Description | Suggested Category | Confidence |
|------------------------|-------------------|------------|
| `road` | Infrastructure | 92% |
| `pothole` | Infrastructure | 92% |

### Activation
- Triggered after **2-second debounce**
- Scans the **description** field for keywords

### Output
```
📁 Suggested Category: Infrastructure

Based on keywords like "pothole" and "road", this appears 
to be an infrastructure issue.

Confidence: 92%
Benefit: Helps route your report to the right department faster
```

### User Action
- User can **Apply** the suggestion with one click
- Or **Dismiss** to keep their manual selection

---

## 4. Priority Suggestion ⚠️

### Purpose
Ensures faster response time from authorities for urgent, safety-related issues.

### Trigger Conditions

| Keyword in Description | Suggested Priority | Confidence |
|------------------------|-------------------|------------|
| `safety` | High | 87% |
| `dangerous` | High | 87% |

### Activation
- Triggered after **2-second debounce**
- Scans the **description** field for safety-related keywords

### Output
```
⚠️ Recommended Priority: High

Safety-related keywords detected. This may require urgent attention.

Confidence: 87%
Benefit: Ensures faster response time from authorities
```

---

## 5. Photo Reminder 📸

### Purpose
Encourages users to attach photos, which significantly improve issue resolution rates.

### Trigger Conditions
- **No photos** attached to the report
- Always triggered when photos array is empty

### Output
```
📸 Photo Reminder

Adding photos helps authorities understand and resolve issues 3x faster.

Confidence: 95%
Benefit: 70% of reports with photos get resolved within 7 days
```

---

## 6. Description Tips ✍️

### Purpose
Guides users to provide more detailed descriptions for better issue resolution.

### Trigger Conditions
- **Description** is less than **100 characters**

### Output
```
✍️ Description Tips

Include specific details like timing, frequency, and exact 
location for better assistance.

Confidence: 88%
Benefit: Detailed reports get assigned to the right team 2x faster
```

### Suggested Details to Include
- **Timing** - When does the issue occur?
- **Frequency** - How often does it happen?
- **Exact Location** - Specific address or landmarks
- **Impact** - Who/what is affected?

---

## 7. AI Insights (RAG-based) 🤖

### Purpose
Provides intelligent insights about civic issue handling using a Retrieval-Augmented Generation (RAG) system.

### Trigger Conditions
- **Description** must have at least **20 characters**
- Triggered after **2-second debounce**

### How It Works
1. Constructs a query based on the category and description
2. Sends request to `http://localhost:8000/api/civic-ai/chat/`
3. RAG system retrieves relevant civic data
4. Returns department info and resolution time estimates

### Query Format
```
"In 2-3 sentences: For [category] issues like "[description excerpt]", 
which department handles this and typical resolution time?"
```

### Output
Returns 2-3 bullet points:
- Which department handles the issue
- Typical resolution timeline
- Any relevant procedures or tips

### Example Response
```
🤖 AI Insights

• Infrastructure issues are handled by the Department of Public Works
• Typical resolution time for pothole repairs is 5-10 business days
• Priority cases involving safety hazards may be expedited

Confidence: High | Based on civic service data
```

---

## Interactive Chat Assistant 💬

### Purpose
Provides conversational assistance for users with questions about civic services.

### Activation
- Click "Chat with AI" button to open chat interface
- Available throughout the report form

### Built-in Responses

| User Input | AI Response |
|------------|-------------|
| `hi`, `hello`, `hey` | Greeting with feature overview |
| `thanks`, `thank you` | Acknowledgment |
| `help` | List of available assistance topics |
| `who are you`, `what are you` | AI introduction |

### RAG Queries
For civic-specific questions, the chat uses the RAG system:
- Endpoint: `http://localhost:8000/api/civic-ai/chat/`
- Returns relevant civic information from trained data

---

## Technical Implementation

### Debounce Timer
```javascript
const timer = setTimeout(() => {
  // AI analysis runs here
}, 2000); // 2-second delay
```

### Dependencies
```javascript
useEffect(() => {
  // Triggers when these change:
}, [formData?.title, formData?.description, formData?.category]);
```

### Confidence Color Coding
| Confidence | Color | CSS Class |
|------------|-------|-----------|
| ≥ 90% | Dark Green | `text-green-600` |
| ≥ 75% | Light Green | `text-green-500` |
| < 75% | Gray | `text-text-secondary` |

---

## Summary Table

| Feature | Trigger Field | Trigger Condition | Debounce |
|---------|--------------|-------------------|----------|
| Duplicate Detection | Title/Description | Keywords: "pothole", "road damage" | 2s |
| Title Enhancement | Title + Description | Title ≥ 5 chars + Description filled | 2s |
| Category Suggestion | Description | Keywords: "road", "pothole" | 2s |
| Priority Suggestion | Description | Keywords: "safety", "dangerous" | 2s |
| Photo Reminder | Photos | No photos attached | 2s |
| Description Tips | Description | Length < 100 chars | 2s |
| AI Insights | Description | Length ≥ 20 chars | 2s |

---

## Future Enhancements

- [ ] Machine learning-based category detection
- [ ] Image analysis for automatic categorization
- [ ] Location-based department routing
- [ ] Historical data for resolution time predictions
- [ ] Multi-language support
- [ ] Voice input for descriptions

---

*Last Updated: January 17, 2026*
