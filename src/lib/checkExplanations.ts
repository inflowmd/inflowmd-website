/**
 * Plain-language explanations for every check, in patient/practice terms.
 * What was checked, and why a physician should care. Factual register, no
 * scare copy.
 *
 * Lives in lib rather than the booth component because the lead-capture
 * emails are composed on the SERVER and must describe findings in exactly
 * the same words the doctor read on screen — and must do so from our own
 * copy, never from text posted by a browser.
 */
export const CHECK_EXPLANATIONS: Record<string, string> = {
  "seo.redirect-chain":
    "How many hops a patient's browser takes before your page starts loading. Each redirect adds waiting time before anything appears on screen.",
  "seo.https":
    "Whether the connection between a patient's browser and this site is encrypted. Browsers mark unencrypted sites “Not secure,” and Google ranks them lower.",
  "seo.title":
    "The headline Google shows in search results — often the first thing a prospective patient reads about the practice.",
  "seo.meta-description":
    "The sentence under the headline in Google results. When it's missing, Google improvises one from page text — often the wrong text.",
  "seo.h1":
    "The page's main heading, the digital equivalent of the name at the top of a chart. Search engines use it to work out what the page is about.",
  "seo.heading-order":
    "Whether headings follow a clean outline. Search engines and screen readers navigate the page by that outline.",
  "seo.viewport":
    "The setting that makes the site resize properly on phones. Without it, patients pinch and zoom — and most leave instead.",
  "seo.canonical":
    "The page's declared official address. It stops search engines treating copies of the same page as competing pages.",
  "seo.open-graph":
    "The preview shown when the site is shared in a text or on social media. Without it, shared links appear bare — no image, no title.",
  "seo.image-alt":
    "Text alternatives for images. Search engines and screen readers can't see photos — they read these instead.",
  "schema.present":
    "Machine-readable code summarizing the practice for search engines and AI assistants. Without any, they work from guesswork.",
  "schema.medical":
    "Structured code that tells Google and AI assistants this is a medical practice — who you are, what you treat, where you are. Without it, search engines guess.",
  "schema.local-business":
    "The address, phone number, and hours in a form search engines read directly — it's how a practice earns its place in local map results.",
  "schema.faq":
    "Patient questions marked up so they can appear as expandable answers directly in Google results — visibility a competitor claims otherwise.",
  "schema.organization":
    "The practice described as an organization, connecting its name, logo, and profiles so search engines treat it as one entity.",
  "ai.robots-file":
    "The file that tells crawlers what they may read — it's how a site controls what search engines and AI tools can see.",
  "ai.crawler-access":
    "Whether ChatGPT, Perplexity, and other AI tools are allowed to read this site. Blocked means invisible when patients ask an AI for a doctor.",
  "ai.llms-txt":
    "An emerging standard that tells AI assistants how to read and summarize your site. Few practices have one yet — which is exactly the opportunity.",
  "ai.semantic-structure":
    "Whether the page's structure lets an AI assistant find the passage that answers a patient's question. Clean outlines get quoted; jumbles get skipped.",
  "ai.content-depth":
    "How much readable text the page carries. AI assistants and search engines need enough substance to draw an answer from.",
};
