"use client";

import Image from "next/image";
import Link from "next/link";
import { CSSProperties, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import EntityCanvas from "./EntityCanvas";
import SmoothScroll, { smoothScrollTo } from "./SmoothScroll";
import Analytics, { trackEvent } from "./Analytics";

type Project = {
  id: string;
  title: string;
  category: string;
  role: string;
  tools: string;
  format: string;
  year: string;
  projectType: "CLIENT WORK" | "PERSONAL PROJECT" | "SELF-PROMOTION";
  sourceNote?: string;
  description: string;
  className: string;
  thumbnail?: string;
  aspectRatio?: string;
  imageSrc?: string;
  kind: "drive" | "drive-folder" | "youtube" | "image";
  driveId?: string;
  youtubeId?: string;
  folderId?: string;
  externalUrl?: string;
  tiktokUrl?: string;
  galleryLabels?: string[];
  campaignMedia?: { label: string; type: "image" | "video"; driveId: string }[];
};

const projects: Project[] = [
  {
    id: "01",
    title: "PROOF NUTRITION — GIVEAWAY CAMPAIGN",
    category: "GRAPHIC DESIGN + MOTION",
    role: "CAMPAIGN VISUALS / 3D COMPOSITING / ANIMATION",
    tools: "PHOTOSHOP / AFTER EFFECTS / BLENDER",
    format: "SOCIAL CAMPAIGN — STATIC + MOTION",
    year: "2025",
    projectType: "CLIENT WORK",
    sourceNote: "Original campaign visuals created for a client. Product assets were supplied by the brand.",
    description:
      "A coordinated three-part social campaign consisting of the giveaway announcement, the winners announcement and an animated launch asset. The work combines product-focused composition, 3D-inspired environments, bold promotional typography and a consistent blue-and-gold visual system.",
    className: "project-campaign",
    thumbnail: "/projects/proof-giveaway.webp",
    kind: "drive-folder",
    folderId: "1j-x5fmSZiHPguX7jP-f0hLv3hIqpv1gS",
    externalUrl: "https://drive.google.com/drive/folders/1j-x5fmSZiHPguX7jP-f0hLv3hIqpv1gS?usp=sharing",
    galleryLabels: ["GIVEAWAY BLUE.PNG", "WINNERS.PNG", "FLYING PROTEINS.MP4"],
    campaignMedia: [
      { label: "GIVEAWAY ANNOUNCEMENT", type: "image", driveId: "1qelDyUSvMbyij-uviOAl3ZYKeooGmS8-" },
      { label: "WINNERS ANNOUNCEMENT", type: "image", driveId: "1P8qYhs4DzDvxLvKzM9KV4prD228fOOFz" },
      { label: "ANIMATED VERSION", type: "video", driveId: "1YfYFOqkQ3UIlwhbhbNIHBduccM8ce61P" },
    ],
  },
  {
    id: "02",
    title: "MICHAEL JORDAN — BEYOND GREATNESS",
    category: "SPORTS DOCUMENTARY / MOTION GRAPHICS",
    role: "EDITING / MOTION GRAPHICS / SOUND DESIGN / VISUAL STORYTELLING",
    tools: "PREMIERE PRO / AFTER EFFECTS / PHOTOSHOP",
    format: "LONG-FORM SPORTS DOCUMENTARY",
    year: "2025",
    projectType: "PERSONAL PROJECT",
    sourceNote: "Edited from sourced archival footage, photography and narration for portfolio demonstration.",
    description:
      "A four-minute sports documentary combining archival footage, narration, kinetic typography, motion graphics, sound design and chronological storytelling to explore Michael Jordan’s career, influence and cultural legacy.",
    className: "project-michael-jordan",
    thumbnail: "/projects/michael-jordan.webp",
    kind: "youtube",
    youtubeId: "RrbArtAU7d4",
    externalUrl: "https://www.youtube.com/watch?v=RrbArtAU7d4",
  },
  {
    id: "03",
    title: "THRTYSIX — CREATIVE SKILLSET",
    category: "SELF-PROMOTIONAL MOTION DESIGN",
    role: "ART DIRECTION / EDITING / MOTION GRAPHICS",
    tools: "AFTER EFFECTS / PREMIERE PRO / PHOTOSHOP",
    format: "30-SECOND BRAND FILM",
    year: "2025",
    projectType: "SELF-PROMOTION",
    description:
      "A compact self-promotional motion piece built around the THRTYSIX identity. It combines green digital textures, handwritten symbols, animated typography and software-driven visual references to communicate editing, motion, design and color skills.",
    className: "project-edit-two",
    thumbnail: "/projects/skillset.webp",
    kind: "drive",
    driveId: "1wDtY3pFcv2Tmk8wd1ZXazsMWn91ONm3j",
    externalUrl: "https://drive.google.com/file/d/1wDtY3pFcv2Tmk8wd1ZXazsMWn91ONm3j/view",
  },
  {
    id: "04",
    title: "THESINNERS — T-SHIRT DESIGN PROCESS",
    category: "DESIGN PROCESS / SOCIAL CONTENT",
    role: "T-SHIRT DESIGN / VIDEO EDITING / CONTENT CREATION",
    tools: "PHOTOSHOP / PREMIERE PRO",
    format: "DESIGN PROCESS VIDEO",
    year: "2025",
    projectType: "PERSONAL PROJECT",
    sourceNote: "Uncommissioned concept created for social media. The brand later responded directly to the post.",
    description:
      "A process video documenting the creation of a T-shirt concept for thesinnerseurope. The edit turns the Photoshop workflow into social content through fast visual progression, design experimentation and a final product reveal. The brand noticed the post and commented directly.",
    className: "project-sinners",
    thumbnail: "/projects/thesinners.webp",
    kind: "drive",
    driveId: "1lcxurYLq_T79iM6UCNKbxeg-XKc9iwR7",
    externalUrl: "https://drive.google.com/file/d/1lcxurYLq_T79iM6UCNKbxeg-XKc9iwR7/view",
    tiktokUrl: "https://www.tiktok.com/@thrtysix/video/7532926185639021846",
  },
  {
    id: "05",
    title: "LAMBORGHINI AVENTADOR — CINEMATIC EDIT",
    category: "AUTOMOTIVE VIDEO EDITING",
    role: "EDITING / COLOR TREATMENT / SOUND DESIGN",
    tools: "PREMIERE PRO / AFTER EFFECTS",
    format: "SHORT-FORM CINEMATIC EDIT",
    year: "2025",
    projectType: "PERSONAL PROJECT",
    sourceNote: "Edited from sourced automotive footage for portfolio demonstration.",
    description:
      "A controlled automotive edit built around low-angle hero shots, mechanical details, tracking footage and a warm industrial grade. The restrained pacing lets the car and cinematography carry the visual impact.",
    className: "project-edit-one",
    thumbnail: "/projects/lamborghini.webp",
    kind: "drive",
    driveId: "1NcihfNtLA9BY_zZMzUfa7Uh_YpD3_igT",
    externalUrl: "https://drive.google.com/file/d/1NcihfNtLA9BY_zZMzUfa7Uh_YpD3_igT/view",
  },
  {
    id: "06",
    title: "TRAVIS SCOTT — DOCUMENTARY",
    category: "MUSIC DOCUMENTARY EDITING",
    role: "EDITING / MOTION GRAPHICS / SOUND DESIGN",
    tools: "PREMIERE PRO / AFTER EFFECTS",
    format: "LONG-FORM MUSIC DOCUMENTARY",
    year: "2025",
    projectType: "PERSONAL PROJECT",
    sourceNote: "Edited from sourced media for portfolio demonstration.",
    description:
      "A documentary-style music edit shaped through archival material, atmospheric pacing, graphic treatments and sound-led transitions. The piece explores the subject through a darker, culture-focused visual language.",
    className: "project-documentary",
    thumbnail: "/projects/travis-scott.webp",
    kind: "drive",
    driveId: "19IreQY3dHcnEW4xRWAGe17CGbHzACYS0",
    externalUrl: "https://drive.google.com/file/d/19IreQY3dHcnEW4xRWAGe17CGbHzACYS0/view",
  },
  {
    id: "07",
    title: "PARALLEL — WEBSITE MOTION BACKGROUND",
    category: "FASHION MOTION DESIGN",
    role: "ANIMATION / LOOP DESIGN / WEB BACKGROUND",
    tools: "AFTER EFFECTS",
    format: "SEAMLESS WEBSITE LOOP",
    year: "2025",
    projectType: "CLIENT WORK",
    sourceNote: "Created as a functional moving background for a clothing-brand website.",
    description:
      "A looping fashion visual built from liquid, fabric-like movement, iridescent color and a centered script mark. The animation was designed to create atmosphere without competing with the website interface.",
    className: "project-web-animation",
    thumbnail: "/projects/parallel.webp",
    kind: "drive",
    driveId: "1YCNVWWysPmPGMTk1a08Fl0z9BIYDN_A7",
    externalUrl: "https://drive.google.com/file/d/1YCNVWWysPmPGMTk1a08Fl0z9BIYDN_A7/view",
  },
  {
    id: "08",
    title: "PIECE 009 — CREATURE IN THE HALLWAY",
    category: "SURREAL DIGITAL ART / 3D COMPOSITING",
    role: "CONCEPT / COMPOSITING / VISUAL DEVELOPMENT",
    tools: "DIGITAL ARTWORK",
    format: "DIGITAL ARTWORK",
    year: "2026",
    projectType: "PERSONAL PROJECT",
    sourceNote: "Original personal artwork.",
    description:
      "A surreal, cinematic composition placing an oversized creature inside a narrow, fluorescent-lit corridor. The reflective floor, cold blue-black treatment and spiral pendant create an uneasy, enclosed atmosphere.",
    className: "project-artwork-009",
    thumbnail: "/projects/piece-009.webp",
    aspectRatio: "4 / 5",
    kind: "image",
    imageSrc: "/projects/piece-009.webp",
  },
  {
    id: "09",
    title: "PIECE 007 — SPIRAL CHARACTER",
    category: "DIGITAL ILLUSTRATION / CHARACTER ART",
    role: "CONCEPT / ILLUSTRATION / VISUAL DEVELOPMENT",
    tools: "DIGITAL ARTWORK",
    format: "CHARACTER ARTWORK",
    year: "2026",
    projectType: "PERSONAL PROJECT",
    sourceNote: "Original personal artwork.",
    description:
      "A minimal black-and-white character drawing built from loose, expressive linework. Spiral eyes and a matching spiral in the open palm connect the image to the THRTYSIX visual language, while the stark black field keeps the character immediate.",
    className: "project-artwork-007",
    thumbnail: "/projects/piece-007.webp",
    aspectRatio: "1 / 1",
    kind: "image",
    imageSrc: "/projects/piece-007.webp",
  },
  {
    id: "10",
    title: "UNTITLED — CHARACTER ARTWORK",
    category: "CHARACTER ART / DIGITAL COMPOSITION",
    role: "CHARACTER DESIGN / VISUAL COMPOSITION",
    tools: "DIGITAL ARTWORK",
    format: "CHARACTER ARTWORK",
    year: "2026",
    projectType: "PERSONAL PROJECT",
    sourceNote: "Original personal artwork.",
    description:
      "A vivid character composition featuring an exaggerated pink creature, sculptural top hat, green spiral eyes and a repeating yellow spiral backdrop. Textured surfaces, sticker-like outlines and contrasting colors give the piece a playful but unsettling tone.",
    className: "project-artwork-new",
    thumbnail: "/projects/untitled-character-artwork.webp",
    aspectRatio: "1 / 1",
    kind: "image",
    imageSrc: "/projects/untitled-character-artwork.webp",
  },
];

const services = ["VIDEO EDITING", "GRAPHIC DESIGN", "MOTION GRAPHICS", "BRANDING", "3D VISUALS"] as const;
type Vars = CSSProperties & Record<"--rx" | "--ry" | "--mx" | "--my", string>;

function projectThumbnail(project: Project) {
  if (project.thumbnail) return project.thumbnail;
  if (project.kind === "drive" && project.driveId) {
    return `https://drive.google.com/thumbnail?id=${project.driveId}&sz=w1600`;
  }
  if (project.kind === "youtube" && project.youtubeId) {
    return `https://i.ytimg.com/vi/${project.youtubeId}/maxresdefault.jpg`;
  }
  return null;
}

function TiltProject({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) {
  const cardRef = useRef<HTMLElement>(null);
  const frameRef = useRef(0);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnail = projectThumbnail(project);

  const handleMove = (event: PointerEvent<HTMLElement>) => {
    const node = cardRef.current;
    if (!node || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const rect = node.getBoundingClientRect();
    pointerRef.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };

    if (frameRef.current) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;
      const current = cardRef.current;
      if (!current) return;

      const { x, y } = pointerRef.current;
      current.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
      current.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
      current.style.setProperty("--mx", `${x * 100}%`);
      current.style.setProperty("--my", `${y * 100}%`);
    });
  };

  const reset = () => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }

    const node = cardRef.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
  };

  const style: Vars = {
    "--rx": "0deg",
    "--ry": "0deg",
    "--mx": "50%",
    "--my": "50%",
  };

  return (
    <article
      ref={cardRef}
      className={`project-card project-card-${project.id}`}
      style={style}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onClick={() => onOpen(project)}
      tabIndex={0}
      aria-label={`Open ${project.title} case study`}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(project);
        }
      }}
    >
      <div className={`project-stage ${project.className}`} style={project.aspectRatio ? { aspectRatio: project.aspectRatio } : undefined}>
        {thumbnail && !imageFailed ? (
          <img
            src={thumbnail}
            alt=""
            className="project-video-thumb"
            style={project.kind === "image" ? { filter: "none", transform: "none", objectFit: "contain", background: "#000" } : undefined}
            loading={project.id === "01" || project.id === "02" ? "eager" : "lazy"}
            draggable={false}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="project-thumbnail-fallback" aria-hidden="true">
            <strong>THRTYSIX</strong>
          </div>
        )}
      </div>

      <div className="project-copy">
        <h3>{project.title}</h3>
      </div>
    </article>
  );
}

function InteractiveFooterWord() {
  const wordRef = useRef<HTMLDivElement>(null);
  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const word = wordRef.current;
    if (!word) return;
    const letters = Array.from(word.querySelectorAll<HTMLElement>(".footer-letter"));
    letters.forEach((letter, index) => {
      const rect = letter.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const strength = Math.max(0, 1 - Math.hypot(dx, dy) / 250);
      const direction = index % 2 === 0 ? 1 : -1;
      letter.style.setProperty("--letter-x", `${dx * strength * 0.07}px`);
      letter.style.setProperty("--letter-y", `${dy * strength * 0.14 - strength * 18}px`);
      letter.style.setProperty("--letter-z", `${strength * 105}px`);
      letter.style.setProperty("--letter-rx", `${dy * strength * -0.07}deg`);
      letter.style.setProperty("--letter-ry", `${dx * strength * 0.08}deg`);
      letter.style.setProperty("--letter-rz", `${direction * strength * 3.2}deg`);
      letter.style.setProperty("--letter-scale", `${1 + strength * 0.11}`);
      letter.style.setProperty("--letter-fill", `${strength}`);
    });
  };

  const resetLetters = () => {
    wordRef.current?.querySelectorAll<HTMLElement>(".footer-letter").forEach((letter) => {
      ["--letter-x", "--letter-y", "--letter-z", "--letter-rx", "--letter-ry", "--letter-rz", "--letter-scale", "--letter-fill"].forEach((name) => letter.style.removeProperty(name));
    });
  };

  return (
    <div ref={wordRef} className="footer-word" aria-label="THRTYSIX" onPointerMove={handleMove} onPointerLeave={resetLetters}>
      {Array.from("THRTYSIX").map((letter, index) => (
        <span className="footer-letter" aria-hidden="true" key={`${letter}-${index}`}>{letter}</span>
      ))}
    </div>
  );
}

export default function PortfolioExperience() {
  useEffect(() => {
    const applyTitle = () => {
      if (document.title !== "THRTYSIX") {
        document.title = "THRTYSIX";
      }
    };

    applyTitle();

    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("pageshow", applyTitle);

    return () => {
      observer.disconnect();
      window.removeEventListener("pageshow", applyTitle);
    };
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!lightboxImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxImage(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxImage]);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const [siteEntered, setSiteEntered] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const workRef = useRef<HTMLElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const activeProjectRef = useRef<Project | null>(null);

  useEffect(() => {
    const hasVisited = window.sessionStorage.getItem("thrtysix-visited") === "1";
    const minimumDuration = hasVisited ? 450 : 950;
    window.sessionStorage.setItem("thrtysix-visited", "1");
    const startedAt = performance.now();
    let leaveTimer = 0;
    let removeTimer = 0;
    const finishLoading = () => {
      const wait = Math.max(0, minimumDuration - (performance.now() - startedAt));
      leaveTimer = window.setTimeout(() => {
        setLoaderLeaving(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setSiteEntered(true)));
        removeTimer = window.setTimeout(() => setLoaderVisible(false), 1050);
      }, wait);
    };
    if (document.readyState === "complete") finishLoading();
    else window.addEventListener("load", finishLoading, { once: true });
    return () => {
      window.removeEventListener("load", finishLoading);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-loading", loaderVisible);
    return () => document.body.classList.remove("is-loading");
  }, [loaderVisible]);

  useEffect(() => { activeProjectRef.current = activeProject; }, [activeProject]);

  useEffect(() => {
    const handlePopState = () => {
      if (activeProjectRef.current) setActiveProject(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!activeProject) return;
    const timer = window.setTimeout(() => modalCloseRef.current?.focus(), 50);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeProject]);

  const openProject = (project: Project) => {
    if (!activeProjectRef.current) window.history.pushState({ thrtysixProjectModal: true }, "", window.location.href);
    setActiveProject(project);
    trackEvent("project_open", { project: project.title });
  };

  const closeProject = () => {
    if (window.history.state?.thrtysixProjectModal) window.history.back();
    else setActiveProject(null);
  };


  useEffect(() => {
    document.body.classList.toggle("locked", menuOpen || Boolean(activeProject));
    return () => document.body.classList.remove("locked");
  }, [menuOpen, activeProject]);

  useEffect(() => {
    const hero = heroRef.current;
    const work = workRef.current;
    if (!hero || !work) return;

    const manifesto = document.querySelector<HTMLElement>(".manifesto");
    const about = document.querySelector<HTMLElement>(".about");
    const contact = document.querySelector<HTMLElement>(".contact");
    const projectCards = Array.from(document.querySelectorAll<HTMLElement>(".project-card"));
    const serviceTiles = Array.from(document.querySelectorAll<HTMLElement>(".service"));
    const footer = document.querySelector<HTMLElement>(".site-footer");

    let frame = 0;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const easeOutExpo = (value: number) =>
      value === 1 ? 1 : 1 - Math.pow(2, -10 * value);
    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

    const sectionProgress = (
      node: HTMLElement,
      start = 1.02,
      end = 0.18
    ) => {
      const viewportHeight = Math.max(window.innerHeight, 1);
      return clamp(
        (viewportHeight * start - node.getBoundingClientRect().top) /
          (viewportHeight * (start - end))
      );
    };

    const render = () => {
      frame = 0;
      const viewportHeight = Math.max(window.innerHeight, 1);

      const heroEase = easeOutCubic(
        clamp(-hero.getBoundingClientRect().top / (viewportHeight * 0.75))
      );

      hero.style.transform = `translate3d(0, ${heroEase * -92}px, 0) scale(${1 - heroEase * 0.085})`;
      hero.style.opacity = `${1 - heroEase * 0.72}`;

      const heroTitle = hero.querySelector<HTMLElement>(".hero h1 span");
      const heroSpace = hero.querySelector<HTMLElement>(".entity-wrap");

      if (heroTitle) {
        heroTitle.style.transform = `translate3d(${heroEase * -125}px, ${heroEase * -28}px, 0) rotateZ(${heroEase * -2.4}deg)`;
        heroTitle.style.opacity = `${1 - heroEase * 0.55}`;
      }


      if (heroSpace) {
        heroSpace.style.transform = `translate3d(${heroEase * 90}px, ${heroEase * -45}px, 0) scale(${1 + heroEase * 0.22}) rotateZ(${heroEase * 3.5}deg)`;
      }

      const workProgress = easeOutExpo(sectionProgress(work, 1.08, 0.16));
      work.style.transform = `translate3d(0, ${(1 - workProgress) * 190}px, 0) scale(${0.9 + workProgress * 0.1})`;
      work.style.opacity = `${0.12 + workProgress * 0.88}`;

      const workTitle = work.querySelector<HTMLElement>(".section-intro");
      if (workTitle) {
        workTitle.style.transform = `translate3d(${(1 - workProgress) * -110}px, ${(1 - workProgress) * 50}px, 0) rotateZ(${(1 - workProgress) * -3.5}deg)`;
      }

      const projectEntrances = [
        { x: -70, y: 120, z: -55, rotateY: 3, rotateZ: -1.4, scale: 0.95 },
        { x: -180, y: 95, z: -90, rotateY: 6, rotateZ: -3.4, scale: 0.91 },
        { x: 190, y: 72, z: -70, rotateY: -7, rotateZ: 3.8, scale: 0.92 },
        { x: 20, y: 150, z: -110, rotateY: -2, rotateZ: 1.2, scale: 0.9 },
        { x: -135, y: 88, z: -65, rotateY: 5, rotateZ: -2.5, scale: 0.93 },
        { x: 155, y: 112, z: -95, rotateY: -6, rotateZ: 2.8, scale: 0.91 },
        { x: 0, y: 145, z: -75, rotateY: 0, rotateZ: -1.1, scale: 0.94 },
      ];

      projectCards.forEach((card, index) => {
        const progress = easeOutCubic(sectionProgress(card, 1.02, 0.25));
        const entrance = projectEntrances[index % projectEntrances.length];
        const remaining = 1 - progress;

        card.style.transform = `perspective(1500px) translate3d(${entrance.x * remaining}px, ${entrance.y * remaining}px, ${entrance.z * remaining}px) rotateY(${entrance.rotateY * remaining}deg) rotateZ(${entrance.rotateZ * remaining}deg) scale(${entrance.scale + progress * (1 - entrance.scale)})`;
        card.style.opacity = `${0.08 + progress * 0.92}`;
      });

      if (manifesto) {
        const progress = easeOutExpo(sectionProgress(manifesto));
        manifesto.style.transform = `translate3d(0, ${(1 - progress) * 150}px, 0) scale(${0.78 + progress * 0.22}) rotateZ(${(1 - progress) * -4}deg)`;
        manifesto.style.opacity = `${0.08 + progress * 0.92}`;
      }

      if (about) {
        const progress = easeOutExpo(sectionProgress(about));
        about.style.transform = `translate3d(${(1 - progress) * -145}px, ${(1 - progress) * 90}px, 0) scale(${0.9 + progress * 0.1})`;
        about.style.opacity = `${0.1 + progress * 0.9}`;

        serviceTiles.forEach((tile, index) => {
          const tileProgress = easeOutCubic(
            clamp(progress * 1.45 - index * 0.1)
          );

          tile.style.opacity = `${0.06 + tileProgress * 0.94}`;
          tile.style.transform = `perspective(1000px) translate3d(${(index % 2 ? -1 : 1) * (1 - tileProgress) * 75}px, ${(1 - tileProgress) * 55}px, ${(1 - tileProgress) * -95}px) rotateY(${(index % 2 ? 1 : -1) * (1 - tileProgress) * 9}deg) scale(${0.88 + tileProgress * 0.12})`;
        });
      }

      if (contact) {
        const progress = easeOutExpo(sectionProgress(contact, 1.06, 0.12));
        contact.style.transform = `perspective(1300px) translate3d(0, ${(1 - progress) * 170}px, 0) rotateX(${(1 - progress) * 7}deg) scale(${0.9 + progress * 0.1})`;
        contact.style.opacity = `${0.08 + progress * 0.92}`;
      }

      if (footer) {
        const progress = easeOutExpo(sectionProgress(footer, 1.08, 0.22));
        footer.style.transform = `perspective(1400px) translate3d(0, ${(1 - progress) * 120}px, 0) rotateX(${(1 - progress) * 8}deg) scale(${0.92 + progress * 0.08})`;
        footer.style.opacity = `${0.08 + progress * 0.92}`;
      }
    };

    const requestRender = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const target = document.getElementById(id);
      if (target) smoothScrollTo(target.getBoundingClientRect().top + window.scrollY);
    }, 80);
  };

  const socialLinks = useMemo(() => [
    { label: "INSTAGRAM", href: "https://www.instagram.com/_thrtysix" },
    { label: "TIKTOK", href: "https://www.tiktok.com/@thrtysix" },
    { label: "X", href: "https://www.x.com/_thrtysix" },
  ], []);

  return (
    <div className={`site-shell ${siteEntered ? "is-entered" : "is-preparing"}`}>
      <style>{`
        /* Artwork cards keep their own aspect ratios after being repositioned. */
        .work .project-list .project-card.project-card-08 .project-stage {
          aspect-ratio: 4 / 5 !important;
        }

        .work .project-list .project-card.project-card-09 .project-stage,
        .work .project-list .project-card.project-card-10 .project-stage {
          aspect-ratio: 1 / 1 !important;
        }

        .work .project-list .project-card.project-card-08 .project-stage .project-video-thumb,
        .work .project-list .project-card.project-card-09 .project-stage .project-video-thumb,
        .work .project-list .project-card.project-card-10 .project-stage .project-video-thumb {
          object-fit: contain !important;
          object-position: center !important;
          transform: none !important;
          filter: none !important;
        }
      `}</style>
      <Analytics />
      {loaderVisible && (
        <div className={`site-loader ${loaderLeaving ? "is-leaving" : ""}`} aria-label="Loading website" role="status">
          <Image src="/brand/spiral.png" width={805} height={532} alt="" className="loader-spiral" priority />
        </div>
      )}
      <SmoothScroll />
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-halo" aria-hidden="true" />

      <header className="site-header">
        <button className="brand" onClick={() => goTo("top")} aria-label="Back to top">
          <Image src="/brand/entity-face.png" width={1031} height={951} alt="THRTYSIX" priority draggable={false} />
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <button onClick={() => goTo("work")}>WORK</button>
          <button onClick={() => goTo("about")}>ABOUT</button>
          <button onClick={() => goTo("contact")}>CONTACT</button>
        </nav>
        <div className="header-actions">
          <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
            <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`}>
        <button onClick={() => goTo("work")}>WORK</button>
        <button onClick={() => goTo("about")}>ABOUT</button>
        <button onClick={() => goTo("contact")}>CONTACT</button>
      </div>

      <main>
        <section ref={heroRef} className="hero hero-scroll-stage" id="top">
          <div className="hero-type" aria-label="THRTYSIX">
            <h1><span>THRTYSIX</span></h1>
          </div>
          <div className="entity-wrap" aria-hidden="true"><EntityCanvas /></div>
        </section>

        <section ref={workRef} className="work work-scroll-reveal" id="work">
          <div className="section-intro"><h2>Selected work.<br />Built to hit.</h2></div>
          <div className="project-list">
            <div className="project-layout-row project-layout-row-top">
              {projects.slice(0, 2).map((project) => (
                <TiltProject key={project.id} project={project} onOpen={openProject} />
              ))}
            </div>

            <div className="project-layout-row project-layout-row-top">
              <TiltProject project={projects[7]} onOpen={openProject} />
              <TiltProject project={projects[2]} onOpen={openProject} />
            </div>

            <div className="project-layout-row project-layout-row-mixed">
              <div className="project-layout-stack">
                <TiltProject project={projects[3]} onOpen={openProject} />
                <TiltProject project={projects[8]} onOpen={openProject} />
              </div>
              <div className="project-layout-stack">
                {projects.slice(4, 6).map((project) => (
                  <TiltProject key={project.id} project={project} onOpen={openProject} />
                ))}
              </div>
            </div>

            <div
              className="project-layout-row project-layout-row-mixed"
              style={{ gridTemplateColumns: "minmax(0, 4fr) minmax(0, 3fr)" }}
            >
              <TiltProject project={projects[6]} onOpen={openProject} />
              <TiltProject project={projects[9]} onOpen={openProject} />
            </div>
          </div>
        </section>

        <section className="manifesto" aria-label="Creative statement">
          <div className="manifesto-object manifesto-mouth" aria-hidden="true">
            <Image src="/brand/mouth-mark.png" width={805} height={532} alt="" />
          </div>
          <h2>IF IT DOESN’T MAKE YOU FEEL SOMETHING, IT’S NOT FINISHED.</h2>
        </section>

        <section className="about" id="about">
          <div className="section-intro about-intro"><h2>Built from obsession,<br />not a template.</h2></div>
          <div className="about-layout">
            <div className="about-copy"><p><strong>THRTYSIX</strong> IS THE CREATIVE IDENTITY OF <span>KRISTIYAN YORDANOV</span> — A VIDEO EDITOR AND GRAPHIC DESIGNER FROM BULGARIA.</p></div>
            <div className="service-list">{services.map((title) => (
              <div className="service" key={title}><strong>{title}</strong></div>
            ))}</div>
          </div>
        </section>

        <section className="contact" id="contact">
          <a
            className="contact-dm-button contact-heading-button"
            href="https://x.com/messages/compose"
            target="_blank"
            rel="noreferrer"
            aria-label="Let&apos;s work together — send me a direct message on X"
            onClick={() => trackEvent("contact_dm_click", { platform: "X" })}
          >
            <span>LET&apos;S WORK<br />TOGETHER</span>
            <strong aria-hidden="true">↗</strong>
          </a>

          <div className="socials social-secondary" aria-label="Other social profiles">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("social_click", { platform: social.label })}
              >
                {social.label} ↗
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <button
          className="footer-mark"
          onClick={() => goTo("top")}
          aria-label="Back to top"
        >
          <Image
            src="/brand/spiral.png"
            width={805}
            height={532}
            alt="THRTYSIX spiral logo"
          />
        </button>

        <InteractiveFooterWord />

        <div className="footer-bottom">
          <span>
            <strong>© {new Date().getFullYear()} THRTYSIX</strong>
            <small>KRISTIYAN YORDANOV</small>
          </span>

          <div>
            <Link href="/privacy">PRIVACY</Link>
            <button onClick={() => goTo("top")}>BACK TO TOP ↑</button>
          </div>
        </div>
      </footer>

      {activeProject && (
        <div className="project-modal case-study-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) closeProject(); }}>
          <button ref={modalCloseRef} className="modal-close" onClick={closeProject} aria-label="Close project">×</button>
          <div className="case-study-media">
            {activeProject.kind === "image" && activeProject.imageSrc ? (
              <img
                src={activeProject.imageSrc}
                alt={activeProject.title}
                draggable={false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "contain",
                  padding: "clamp(14px, 3vw, 48px)",
                }}
              />
            ) : activeProject.kind === "youtube" && activeProject.youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeProject.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                title={activeProject.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ) : activeProject.kind === "drive" && activeProject.driveId ? (
              <iframe src={`https://drive.google.com/file/d/${activeProject.driveId}/preview`} title={activeProject.title} allow="autoplay; fullscreen" allowFullScreen loading="lazy" />
            ) : activeProject.campaignMedia ? (
              <div className="campaign-case-study-grid">
                {activeProject.campaignMedia.map((media) => (
                  <figure className={`campaign-case-study-item is-${media.type}`} key={media.driveId}>
                    {media.type === "video" ? (
                      <iframe src={`https://drive.google.com/file/d/${media.driveId}/preview`} title={media.label} allow="autoplay; fullscreen" allowFullScreen loading="lazy" />
                    ) : (
                      <button
                        type="button"
                        className="campaign-image-button"
                        onClick={() =>
                          setLightboxImage({
                            src: `https://drive.google.com/thumbnail?id=${media.driveId}&sz=w3000`,
                            alt: media.label,
                          })
                        }
                        aria-label={`Open ${media.label} fullscreen`}
                      >
                        <img
                          src={`https://drive.google.com/thumbnail?id=${media.driveId}&sz=w2000`}
                          alt={media.label}
                          loading="lazy"
                          draggable={false}
                        />
                      </button>
                    )}
                  </figure>
                ))}
              </div>
            ) : activeProject.folderId ? (
              <iframe src={`https://drive.google.com/embeddedfolderview?id=${activeProject.folderId}#grid`} title={`${activeProject.title} files`} loading="lazy" />
            ) : null}
          </div>
          <aside className="case-study-copy">
            <h2 id="project-modal-title">{activeProject.title}</h2>
            <p>{activeProject.description}</p>
            <div className="case-study-links">
              {activeProject.kind === "youtube" && activeProject.externalUrl && (
                <a href={activeProject.externalUrl} target="_blank" rel="noreferrer">
                  WATCH ON YOUTUBE ↗
                </a>
              )}
              {activeProject.tiktokUrl && (
                <a
                  href={activeProject.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("tiktok_project_click", { project: activeProject.title })}
                >
                  WATCH ON TIKTOK ↗
                </a>
              )}
            </div>
          </aside>
        </div>
      )}

      {lightboxImage && (
        <div
          className="project-image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen project image"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLightboxImage(null);
          }}
        >
          <button
            type="button"
            className="project-image-lightbox-close"
            onClick={() => setLightboxImage(null)}
            aria-label="Close fullscreen image"
          >
            ×
          </button>

          <div className="project-image-lightbox-content">
            <img src={lightboxImage.src} alt={lightboxImage.alt} />
          </div>
        </div>
      )}
    </div>
  );
}
