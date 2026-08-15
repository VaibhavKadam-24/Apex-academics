# Contributing to Apex Academics 📚

Thank you for your interest in contributing to **Apex Academics**! This project is built by students, for students, and we welcome all contributions — whether it's adding a new free resource, fixing a broken link, or improving code.

---

## 📌 Rules for Adding Resources

Before submitting a resource, please ensure:
1. ✅ **100% Free:** The resource must be legally free to read, watch, or audit (no hidden paywalls, no pirate/copyright-infringing links).
2. 🔗 **Valid Link:** The link must open directly to the official or trusted provider (e.g., NPTEL, MIT OCW, GitHub, Official Docs, Coursera free audit).
3. 🏷️ **Proper Categorization:** Assign the correct category (`ebook`, `course`, `certification`), subject, level (`Beginner`, `Intermediate`, `Advanced`), and language.

---

## 🚀 How to Add a Resource via GitHub

1. **Fork the repository** on GitHub.
2. Open `data/resources.json`.
3. Add your resource entry to the JSON list following this format:

```json
{
  "id": 73,
  "title": "Name of the Book or Course",
  "author": "Author or Institution",
  "category": "ebook",
  "subject": "Topic/Language",
  "level": "Beginner",
  "language": "English",
  "link": "https://example.com/link",
  "source": "Official Source",
  "tags": ["tag1", "tag2", "bca", "programming"]
}
```

4. Make sure your JSON syntax is valid (no trailing commas after the last item).
5. Submit a **Pull Request (PR)** with a clear title like `Add: Free Course for Python`.

---

## 🐛 Reporting Issues or Broken Links

Found a broken link or a bug? Please [Open an Issue](https://github.com/VaibhavKadam-24/Apex-academics/issues) with:
- The title of the resource
- The broken URL
- Suggested replacement URL (if known)

Thank you for helping make education accessible to every student! 🎓
