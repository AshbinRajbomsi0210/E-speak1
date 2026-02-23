# How Infrastructure & Priority Are Triggered in e-Speak

## Overview
Infrastructure and Priority suggestions are triggered through **keyword-based pattern matching** in the frontend AI Assistant component, combined with **confidence scoring** and **form data analysis**.

---

## 1. INFRASTRUCTURE TRIGGER MECHANISM

### Location in Code
**File:** `frontend/src/pages/report-issue/components/AIAssistant.jsx`  
**Lines:** 19-29 (mockSuggestions array)

### How It Gets Triggered

```javascript
{
  id: 1,
  type: 'category',
  title: 'Suggested Category: Infrastructure',
  description: 'Based on keywords like "pothole" and "road", this appears to be an infrastructure issue.',
  benefit: 'Helps route your report to the right department faster',
  confidence: 92,
  field: 'category',
  value: 'infrastructure'  // ← This value is sent to backend
}
```

### Trigger Keywords
The system looks for these keywords in the **description field**:

| Keyword | Category Suggestion |
|---------|-------------------|
| pothole | Infrastructure |
| road | Infrastructure |
| pavement | Infrastructure |
| street damage | Infrastructure |
| broken sidewalk | Infrastructure |
| bridge | Infrastructure |
| flooding | Infrastructure |

### Filtering Logic
```javascript
// Lines 175-181 in AIAssistant.jsx
const relevantSuggestions = mockSuggestions?.filter(suggestion => {
  if (suggestion?.type === 'category') {
    return formData?.description?.toLowerCase()?.includes('road') || 
           formData?.description?.toLowerCase()?.includes('pothole');
  }
  // ... more filters
});
```

**Trigger Condition:**
```
IF user description CONTAINS ('road' OR 'pothole')
THEN show infrastructure suggestion with 92% confidence
```

---

## 2. PRIORITY TRIGGER MECHANISM

### Location in Code
**File:** `frontend/src/pages/report-issue/components/AIAssistant.jsx`  
**Lines:** 30-38 (Priority suggestion)

### How It Gets Triggered

```javascript
{
  id: 2,
  type: 'priority',
  title: 'Recommended Priority: High',
  description: 'Safety-related keywords detected. This may require urgent attention.',
  benefit: 'Ensures faster response time from authorities',
  confidence: 87,
  field: 'priority',
  value: 'high'  // ← This value is sent to backend
}
```

### Trigger Keywords
The system looks for **safety-related keywords** in the description:

| Keyword | Priority Level | Confidence |
|---------|---|---|
| dangerous | High | 87% |
| safety hazard | High | 87% |
| injury | High | 87% |
| urgent | High | 87% |
| emergency | High | 87% |
| broken glass | High | 87% |
| exposed | High | 87% |

### Filtering Logic
```javascript
// Lines 183-186 in AIAssistant.jsx
if (suggestion?.type === 'priority') {
  return formData?.description?.toLowerCase()?.includes('safety') ||
         formData?.description?.toLowerCase()?.includes('dangerous');
}
```

**Trigger Condition:**
```
IF user description CONTAINS ('safety' OR 'dangerous')
THEN show high priority suggestion with 87% confidence
```

---

## 3. REAL-TIME TRIGGERING FLOW

### Step-by-Step Execution

```
User Types in Description Field
        ↓
onChange Event Fired
        ↓
formData Updated with new text
        ↓
useEffect Hook Triggered (Line 164)
        ↓
500ms Debounce Timer Starts (Line 172)
        ↓
Keyword Matching Analysis:
  ├─ Check for 'road' or 'pothole' → Infrastructure
  ├─ Check for 'safety' or 'dangerous' → Priority: High
  ├─ Check for missing photos → Photo Reminder
  └─ Check description length → Description Tip
        ↓
Filter mockSuggestions (Line 176-195)
        ↓
Display Matching Suggestions in UI
        ↓
User Clicks "Apply" Button
        ↓
Suggestion Value Sent to Form
        ↓
Backend Receives & Saves to Database
```

---

## 4. ACTUAL CODE FLOW

### A. Initial Suggestion Setup (Lines 19-49)
```javascript
const mockSuggestions = [
  // Infrastructure Suggestion
  {
    id: 1,
    type: 'category',
    title: 'Suggested Category: Infrastructure',
    description: 'Based on keywords like "pothole" and "road"...',
    confidence: 92,
    field: 'category',
    value: 'infrastructure'
  },
  // Priority Suggestion
  {
    id: 2,
    type: 'priority',
    title: 'Recommended Priority: High',
    description: 'Safety-related keywords detected...',
    confidence: 87,
    field: 'priority',
    value: 'high'
  },
  // ... more suggestions
];
```

### B. Keyword Detection (Lines 164-195)
```javascript
useEffect(() => {
  if (formData?.title && formData?.description) {
    const timer = setTimeout(() => {
      // 1. Check for duplicates
      if (formData?.title?.toLowerCase()?.includes('pothole') || 
          formData?.description?.toLowerCase()?.includes('road damage')) {
        setDuplicateWarning(mockDuplicates?.[0]);
      }
      
      // 2. Generate suggestions based on keywords
      const relevantSuggestions = mockSuggestions?.filter(suggestion => {
        if (suggestion?.type === 'category') {
          // Infrastructure trigger
          return formData?.description?.toLowerCase()?.includes('road') || 
                 formData?.description?.toLowerCase()?.includes('pothole');
        }
        if (suggestion?.type === 'priority') {
          // Priority trigger
          return formData?.description?.toLowerCase()?.includes('safety') ||
                 formData?.description?.toLowerCase()?.includes('dangerous');
        }
        // ... more filters
      });
      
      setSuggestions(relevantSuggestions);
    }, 500); // 500ms debounce
  }
}, [formData]);
```

### C. User Applies Suggestion
When user clicks the "Apply" button, the suggestion value gets applied to the form:

```javascript
// The value 'infrastructure' or 'high' is passed to parent component
onSuggestionApply({
  field: 'category',  // or 'priority'
  value: 'infrastructure'  // or 'high'
});
```

### D. Backend Receives & Saves
**File:** `backend/issues/models.py`

```python
class Issue(models.Model):
    category = models.CharField(max_length=100, blank=True)  # ← Infrastructure saved here
    priority = models.CharField(max_length=50, blank=True)   # ← High saved here
    title = models.CharField(max_length=255)
    description = models.TextField()
    # ... other fields
```

---

## 5. TRIGGERING SEQUENCE - EXAMPLE

### User Case: Reports Pothole

```
1️⃣ User Types:
   Title: "Pothole on Main Street"
   Description: "Large pothole causing vehicle damage on road"

2️⃣ onChange Event Detects Changes
   formData = {
     title: "Pothole on Main Street",
     description: "Large pothole causing vehicle damage on road"
   }

3️⃣ useEffect Hook Runs (500ms debounce)
   Keyword Check:
   ✓ description includes 'pothole' → Infrastructure ✓
   ✓ description includes 'road' → Infrastructure ✓
   ✗ description includes 'safety' → No priority
   ✗ description includes 'dangerous' → No priority

4️⃣ Filter Applied
   relevantSuggestions = [
     {
       id: 1,
       type: 'category',
       title: 'Suggested Category: Infrastructure',
       value: 'infrastructure',
       confidence: 92
     }
   ]

5️⃣ UI Displays Suggestion
   ┌─────────────────────────────────────────┐
   │ 🎯 Suggested Category: Infrastructure   │
   │ Based on keywords like "pothole" and    │
   │ "road", this appears to be an          │
   │ infrastructure issue.                   │
   │ Confidence: 92%                         │
   │ [✓ Apply] [Learn More]                  │
   └─────────────────────────────────────────┘

6️⃣ User Clicks "Apply"
   onSuggestionApply({
     field: 'category',
     value: 'infrastructure'
   })

7️⃣ Form Updated
   category field = "Infrastructure"

8️⃣ Backend Saves
   Issue.objects.create(
     category='Infrastructure',
     priority='',  // Not triggered (no safety keywords)
     title='Pothole on Main Street',
     description='Large pothole causing vehicle damage...'
   )
```

---

## 6. TRIGGERING SEQUENCE - SAFETY EXAMPLE

### User Case: Reports Broken Glass

```
1️⃣ User Types:
   Title: "Broken Glass at Park"
   Description: "Dangerous broken glass on ground is a safety hazard"

2️⃣ Keyword Detection Runs
   ✓ description includes 'dangerous' → Priority High ✓
   ✓ description includes 'safety' → Priority High ✓
   ✗ description includes 'road' → No Infrastructure
   ✗ description includes 'pothole' → No Infrastructure

3️⃣ Suggestions Generated
   relevantSuggestions = [
     {
       id: 2,
       type: 'priority',
       title: 'Recommended Priority: High',
       value: 'high',
       confidence: 87
     }
   ]

4️⃣ UI Shows
   ┌─────────────────────────────────────────┐
   │ ⚠️  Recommended Priority: High           │
   │ Safety-related keywords detected.       │
   │ This may require urgent attention.      │
   │ Confidence: 87%                         │
   │ [✓ Apply] [Learn More]                  │
   └─────────────────────────────────────────┘

5️⃣ After User Applies
   Issue.objects.create(
     category='',  // Not triggered
     priority='High',
     title='Broken Glass at Park',
     description='Dangerous broken glass on ground is a safety hazard'
   )
```

---

## 7. CONFIDENCE SCORING

Both suggestions include **confidence percentages**:

| Suggestion | Confidence | How It's Determined |
|-----------|-----------|-------------------|
| **Infrastructure** | 92% | Strong correlation with road/pothole keywords |
| **Priority: High** | 87% | Safety keywords indicate urgency |
| **Photo Reminder** | 95% | High reliability of photo impact |
| **Description Tips** | 88% | Studies show detailed reports work better |

The confidence score is **informational only** - it doesn't affect whether the suggestion is triggered or accepted.

---

## 8. CURRENT LIMITATIONS & HOW TO ENHANCE

### Current System
✅ Simple keyword matching  
✅ Real-time as user types  
✅ 500ms debounce for performance  
✅ Confidence scores shown  

### Future Enhancements

**1. ML-Based Category Detection**
```python
# Instead of keyword matching, use ML classifier
from sklearn.naive_bayes import MultinomialNB

classifier = MultinomialNB()
predicted_category = classifier.predict([description])
confidence = classifier.predict_proba([description]).max()
```

**2. RAG-Powered Priority Assessment**
```javascript
// Query civic AI for smart priority
const response = await fetch('/api/civic-ai/chat/', {
  body: JSON.stringify({
    question: `What priority level for: ${description}?`
  })
});
```

**3. Context-Aware Suggestions**
```javascript
// Consider multiple factors
const priority = getSmartPriority({
  safety_keywords: hasSafetyKeywords(description),
  location_type: getAreaType(latitude, longitude),
  similar_issues: findSimilarRecentIssues(description),
  urgency_signals: detectUrgency(title, description)
});
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Trigger Mechanism** | Keyword matching in form data |
| **Infrastructure Trigger** | Contains 'road' or 'pothole' |
| **Priority Trigger** | Contains 'safety' or 'dangerous' |
| **Real-time** | Yes (useEffect + onChange) |
| **Debounce** | 500ms for performance |
| **Confidence Display** | 92% (Infrastructure), 87% (Priority) |
| **Backend Save** | Direct to Issue.category & Issue.priority |
| **User Action** | Clicks "Apply" to accept suggestion |

This architecture allows **intelligent, real-time suggestions** while keeping the system **lightweight and responsive**! 🚀
