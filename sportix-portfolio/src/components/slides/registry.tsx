import type { ComponentType } from "react";
import type { SlideId } from "@/lib/portfolio/meta";
import { SlideCover } from "./s01-cover";
import { SlideBigIdea } from "./s02-big-idea";
import { SlideWhy } from "./s03-why";
import { SlideMap } from "./s04-map";
import { SlideSystems } from "./s05-systems";
import { SlideEvidence } from "./s06-evidence";
import { SlideEcosystem } from "./s07-ecosystem";
import { SlideAthleteJourney } from "./s08-athlete-journey";
import { SlidePathway } from "./s09-pathway";
import { SlideFootball } from "./s10-football";
import { SlideVision } from "./s11-vision";
import { SlideSensors } from "./s12-sensors";
import { SlideYhh } from "./s13-yhh";
import { SlideVisitor } from "./s14-visitor";
import { SlidePassport } from "./s15-passport";
import { SlideSecurity } from "./s16-security";
import { SlideCommercial } from "./s17-commercial";
import { SlideWhoPays } from "./s18-who-pays";
import { SlideFlywheel } from "./s19-flywheel";
import { SlideIp } from "./s20-ip";
import { SlideStage } from "./s21-stage";
import { SlideRoadmap } from "./s22-roadmap";
import { SlideExpansion } from "./s23-expansion";
import { SlideClose } from "./s24-close";

export const SLIDE_COMPONENTS: Record<SlideId, ComponentType> = {
  cover: SlideCover,
  "big-idea": SlideBigIdea,
  why: SlideWhy,
  "ecosystem-map": SlideMap,
  "ai-systems": SlideSystems,
  "data-to-intelligence": SlideEvidence,
  "sportix-ecosystem": SlideEcosystem,
  "athlete-journey": SlideAthleteJourney,
  "athlete-pathway": SlidePathway,
  "football-talent": SlideFootball,
  "computer-vision": SlideVision,
  "sensor-innovation": SlideSensors,
  "yalla-hayyihom": SlideYhh,
  "visitor-journey": SlideVisitor,
  "cultural-passport": SlidePassport,
  security: SlideSecurity,
  commercial: SlideCommercial,
  "who-pays": SlideWhoPays,
  flywheel: SlideFlywheel,
  ip: SlideIp,
  stage: SlideStage,
  roadmap: SlideRoadmap,
  expansion: SlideExpansion,
  close: SlideClose,
};
