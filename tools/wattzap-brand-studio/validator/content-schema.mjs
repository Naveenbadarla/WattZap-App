/**
 * Zod validation for WattZap slide-content JSON.
 * Mirrors brand/schemas/slide-content.schema.json (the canonical, tool-agnostic schema).
 * Limits come from brand/tokens/brand-tokens.json → content.
 */
import { z } from "zod";
import { loadTokens } from "../renderer/lib.mjs";

const limits = loadTokens().content;

export const TEMPLATE_IDS = [
  "title-slide",
  "three-column-overview",
  "four-card-requirements",
  "process-flow",
  "architecture",
  "timeline",
  "business-case",
  "comparison",
];

const bullet = z.string().min(1).max(limits.maxBulletChars);
const heading = z.string().min(1).max(60);
const icon = z.string().regex(/^[a-z0-9-]+$/).optional();

const contentByTemplate = {
  "title-slide": z.object({
    kicker: z.string().max(60).optional(),
    highlights: z.array(z.string().max(70)).max(3).optional(),
    dateLine: z.string().max(90).optional(),
  }),
  "three-column-overview": z.object({
    columns: z
      .array(z.object({ icon, heading, bullets: z.array(bullet).min(1).max(limits.maxBulletsPerCard) }))
      .length(3),
    outcomes: z.array(z.string().max(70)).max(3).optional(),
  }),
  "four-card-requirements": z.object({
    cards: z
      .array(z.object({ icon, heading, bullets: z.array(bullet).min(1).max(4) }))
      .length(4),
    note: z.string().max(160).optional(),
  }),
  "process-flow": z.object({
    steps: z
      .array(z.object({ icon, heading, caption: z.string().max(120).optional() }))
      .min(3)
      .max(limits.maxProcessSteps),
    outcomes: z.array(z.string().max(70)).max(3).optional(),
  }),
  architecture: z.object({
    layers: z
      .array(z.object({ icon, heading, items: z.array(z.string().max(40)).min(1).max(limits.maxBulletsPerCard) }))
      .min(2)
      .max(4),
    note: z.string().max(160).optional(),
  }),
  timeline: z.object({
    milestones: z
      .array(z.object({ label: z.string().max(30), heading, bullets: z.array(bullet).max(3) }))
      .min(3)
      .max(limits.maxTimelineMilestones),
    note: z.string().max(160).optional(),
  }),
  "business-case": z.object({
    metrics: z
      .array(z.object({ value: z.string().max(16), label: z.string().max(40), caption: z.string().max(90).optional() }))
      .min(2)
      .max(limits.maxMetrics),
    bullets: z.array(bullet).max(limits.maxBulletsPerCard).optional(),
    note: z.string().max(160).optional(),
  }),
  comparison: z.object({
    options: z
      .array(
        z.object({
          icon,
          heading,
          tagline: z.string().max(110).optional(),
          badge: z.string().max(40).optional(),
          featured: z.boolean().optional(),
          bullets: z.array(bullet).min(1).max(limits.maxBulletsPerCard),
        })
      )
      .min(2)
      .max(3),
    note: z.string().max(160).optional(),
  }),
};

const base = z.object({
  template: z.enum(TEMPLATE_IDS),
  deck: z.string().max(90).optional(),
  slideNumber: z.number().int().min(1).optional(),
  totalSlides: z.number().int().min(1).optional(),
  sectionLabel: z.string().max(40).optional(),
  title: z.string().min(1).max(limits.maxTitleChars),
  titleAccent: z.string().max(limits.maxTitleChars).optional(),
  subtitle: z.string().max(limits.maxSubtitleChars).optional(),
  supporting: z.string().max(220).optional(),
  footerNote: z.string().max(90).optional(),
  a11yLabel: z.string().max(200).optional(),
  content: z.record(z.any()),
});

export function validateSlide(json, fileLabel = "slide") {
  const errors = [];
  const parsed = base.safeParse(json);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${fileLabel}: ${issue.path.join(".") || "(root)"} — ${issue.message}`);
    }
    return { ok: false, errors };
  }
  const slide = parsed.data;
  const contentSchema = contentByTemplate[slide.template];
  const c = contentSchema.safeParse(slide.content);
  if (!c.success) {
    for (const issue of c.error.issues) {
      errors.push(`${fileLabel}: content.${issue.path.join(".")} — ${issue.message}`);
    }
    return { ok: false, errors };
  }
  if (slide.titleAccent && !slide.title.includes(slide.titleAccent)) {
    errors.push(`${fileLabel}: titleAccent must be a substring of title`);
  }
  if ((slide.slideNumber && !slide.totalSlides) || (!slide.slideNumber && slide.totalSlides)) {
    errors.push(`${fileLabel}: slideNumber and totalSlides must be provided together`);
  }
  if (slide.totalSlides && slide.slideNumber > slide.totalSlides) {
    errors.push(`${fileLabel}: slideNumber exceeds totalSlides`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, slide: { ...slide, content: c.data } };
}
