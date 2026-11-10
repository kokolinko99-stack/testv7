"use client";

import { useEffect } from "react";

const GRID_SELECTOR = ".project-list";
const CARD_SELECTOR = ".project-card";
const ACTIVE_CLASS = "project-masonry-active";
const GIVEAWAY_STAGE_SELECTOR = ".project-card-01 .project-stage";
const SINS_THUMBNAIL_SELECTOR = ".project-card-04 .project-video-thumb";
const SINS_THUMBNAIL_URL = "/projects/thesinners-32s-thumbnail.jpg";
const TRAVIS_THUMBNAIL_SELECTOR = ".project-card-06 .project-video-thumb";
const TRAVIS_THUMBNAIL_URL = "/projects/travis-scott-61s-thumbnail.jpg";
const CASE_STUDY_TITLE_SELECTOR = "#project-modal-title, .case-study-copy h2";
const DIRECT_X_DM_URL =
  "https://x.com/messages/compose?recipient_id=1408901121167527938";
const HERO_HEADING_SELECTOR = ".hero h1";
const HERO_PROFESSION_TEXT = "VIDEO EDITOR + GRAPHIC DESIGNER";

const SINNERS_TITLE = "THESINNERS";
const LAMBORGHINI_TITLE = "LAMBORGHINI AVENTADOR";
const LAMBORGHINI_DRIVE_ID = "1rD6YVZWp_6EaMTuWmk-s3pQLY6pFxoJh";
const LAMBORGHINI_PREVIEW_URL =
  `https://drive.google.com/file/d/${LAMBORGHINI_DRIVE_ID}/preview`;

const giveawayVersions = [
  {
    label: "GIVEAWAY ANNOUNCEMENT",
    driveId: "1qelDyUSvMbyij-uviOAl3ZYKeooGmS8-",
    className: "is-giveaway",
  },
  {
    label: "WINNERS ANNOUNCEMENT",
    driveId: "1P8qYhs4DzDvxLvKzM9KV4prD228fOOFz",
    className: "is-winners",
  },
  {
    label: "ANIMATED VERSION",
    driveId: "1YfYFOqkQ3UIlwhbhbNIHBduccM8ce61P",
    className: "is-animated",
  },
] as const;

const GIVEAWAY_ANIMATED_THUMBNAIL_URL = "/projects/proof-giveaway-animated-3s-thumbnail.jpg";

export default function WorkSectionPatch() {
  useEffect(() => {
    let grid: HTMLElement | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let gridObserver: MutationObserver | null = null;
    let modalObserver: MutationObserver | null = null;
    let animationFrame = 0;
    let mounted = true;
    let giveawayStage: HTMLElement | null = null;
    let originalGiveawayNodes: Node[] = [];
    const installedViewBadges: HTMLElement[] = [];
    const viewBadgeCleanups: Array<() => void> = [];
    const navigationRestoreTimers: number[] = [];

    const clearCardRows = () => {
      grid?.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach((card) => {
        card.style.removeProperty("grid-row-end");
      });
    };

    const measure = () => {
      if (!grid || !mounted) return;

      if (window.innerWidth < 760) {
        clearCardRows();
        return;
      }

      const gridStyle = window.getComputedStyle(grid);
      const rowHeight = Number.parseFloat(gridStyle.gridAutoRows);
      const rowGap = Number.parseFloat(gridStyle.rowGap);

      if (!Number.isFinite(rowHeight) || rowHeight <= 0) return;

      grid.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach((card) => {
        const cardHeight = card.getBoundingClientRect().height;
        const span = Math.max(
          1,
          Math.ceil((cardHeight + rowGap) / (rowHeight + rowGap)),
        );

        card.style.gridRowEnd = `span ${span}`;
      });
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measure);
    };

    const installHeroProfession = () => {
      const heading = document.querySelector<HTMLElement>(HERO_HEADING_SELECTOR);

      if (!heading || heading.querySelector(".hero-profession-line")) return;

      const subtitle = document.createElement("span");
      subtitle.className = "hero-profession-line";
      subtitle.textContent = HERO_PROFESSION_TEXT;
      subtitle.setAttribute("aria-label", "Video editor and graphic designer");
      heading.append(subtitle);
    };

    const installDirectMessageLink = () => {
      const link = Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).find(
        (anchor) =>
          anchor.textContent
            ?.replace(/\s+/g, " ")
            .trim()
            .toUpperCase()
            .includes("LET'S WORK TOGETHER"),
      );

      if (!link) return;

      link.href = DIRECT_X_DM_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Send THRTYSIX a direct message on X");
      link.dataset.directXMessage = "true";
    };

    const installGiveawayVersions = () => {
      const stage = document.querySelector<HTMLElement>(GIVEAWAY_STAGE_SELECTOR);
      if (!stage || stage.dataset.giveawayVersions === "true") return;

      giveawayStage = stage;
      originalGiveawayNodes = Array.from(stage.childNodes);

      const mosaic = document.createElement("div");
      mosaic.className = "giveaway-version-mosaic";
      mosaic.setAttribute("aria-hidden", "true");

      giveawayVersions.forEach((version) => {
        const item = document.createElement("div");
        item.className = `giveaway-version-item ${version.className}`;

        const image = document.createElement("img");
        image.className = "giveaway-version-image";
        image.src =
          version.className === "is-animated"
            ? GIVEAWAY_ANIMATED_THUMBNAIL_URL
            : `https://drive.google.com/thumbnail?id=${version.driveId}&sz=w1400`;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        image.draggable = false;

        const label = document.createElement("span");
        label.className = "giveaway-version-label";
        label.textContent = version.label;

        if (version.className === "is-animated") {
          const play = document.createElement("span");
          play.className = "giveaway-version-play";
          play.textContent = "▶";
          item.append(play);
        }

        item.append(image, label);
        mosaic.append(item);
      });

      stage.replaceChildren(mosaic);
      stage.dataset.giveawayVersions = "true";
      scheduleMeasure();
    };

    const installViewBadges = () => {
      document.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach((card) => {
        const stage = card.querySelector<HTMLElement>(".project-stage");
        if (!stage) return;

        let badge = stage.querySelector<HTMLElement>(".project-view-badge");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "project-view-badge";
          badge.textContent = "VIEW ↗";
          badge.setAttribute("aria-hidden", "true");
          stage.append(badge);
          installedViewBadges.push(badge);
        }

        if (card.dataset.viewBadgeHoverBound === "true") return;
        card.dataset.viewBadgeHoverBound = "true";

        const activate = () => card.classList.add("is-view-hovered");
        const deactivate = () => card.classList.remove("is-view-hovered");

        card.addEventListener("pointerenter", activate);
        card.addEventListener("pointerleave", deactivate);
        card.addEventListener("focusin", activate);
        card.addEventListener("focusout", deactivate);

        viewBadgeCleanups.push(() => {
          card.removeEventListener("pointerenter", activate);
          card.removeEventListener("pointerleave", deactivate);
          card.removeEventListener("focusin", activate);
          card.removeEventListener("focusout", deactivate);
          card.classList.remove("is-view-hovered");
          delete card.dataset.viewBadgeHoverBound;
        });
      });
    };

    const restoreGiveawayStage = () => {
      if (!giveawayStage || giveawayStage.dataset.giveawayVersions !== "true") {
        return;
      }

      giveawayStage.replaceChildren(...originalGiveawayNodes);
      delete giveawayStage.dataset.giveawayVersions;
    };

    const installMichaelJordanThumbnail = () => {
      const image = document.querySelector<HTMLImageElement>(
        ".project-card-02 .project-video-thumb",
      );

      if (!image || image.dataset.youtubeThumbnail === "true") return;

      image.dataset.youtubeThumbnail = "true";
      image.src = "https://i.ytimg.com/vi/RrbArtAU7d4/maxresdefault.jpg";
      image.onerror = () => {
        image.onerror = null;
        image.src = "https://i.ytimg.com/vi/RrbArtAU7d4/hqdefault.jpg";
      };
    };

    const installSinnersThumbnail = () => {
      const image = document.querySelector<HTMLImageElement>(SINS_THUMBNAIL_SELECTOR);

      if (!image || image.dataset.sinnersThumbnail === "true") return;

      image.dataset.sinnersThumbnail = "true";
      image.src = SINS_THUMBNAIL_URL;
      image.loading = "lazy";
      image.decoding = "async";
      image.alt = "THESINNERS video thumbnail from the 32nd second";
      image.style.objectPosition = "center center";
    };

    const installTravisThumbnail = () => {
      const image = document.querySelector<HTMLImageElement>(TRAVIS_THUMBNAIL_SELECTOR);

      if (!image || image.dataset.travisThumbnail === "true") return;

      image.dataset.travisThumbnail = "true";
      image.src = TRAVIS_THUMBNAIL_URL;
      image.loading = "lazy";
      image.decoding = "async";
      image.alt = "Travis Scott documentary thumbnail from 1 minute and 1 second";
      image.style.objectPosition = "center center";
    };

    const installSinnersComment = () => {
      const existingComments = Array.from(
        document.querySelectorAll<HTMLElement>(".sinners-tiktok-comment"),
      );

      const heading = Array.from(
        document.querySelectorAll<HTMLHeadingElement>(
          CASE_STUDY_TITLE_SELECTOR,
        ),
      ).find((element) =>
        element.textContent?.toUpperCase().includes(SINNERS_TITLE),
      );

      if (!heading) {
        existingComments.forEach((comment) => comment.remove());
        return;
      }

      const dialog = heading.closest<HTMLElement>('[role="dialog"]');
      const modalRoot = dialog ?? heading.parentElement?.parentElement?.parentElement;
      const copy = modalRoot?.querySelector<HTMLElement>(".case-study-copy");

      if (!copy) {
        existingComments.forEach((comment) => comment.remove());
        return;
      }

      existingComments.forEach((comment) => {
        if (!copy.contains(comment)) comment.remove();
      });

      if (copy.querySelector(".sinners-tiktok-comment")) return;

      const commentSection = document.createElement("section");
      commentSection.className = "sinners-tiktok-comment";
      commentSection.setAttribute(
        "aria-label",
        "TikTok comment from thesinnerseurope",
      );

      const eyebrow = document.createElement("div");
      eyebrow.className = "sinners-tiktok-comment-eyebrow";

      const platform = document.createElement("span");
      platform.textContent = "TIKTOK COMMENT";

      const count = document.createElement("span");
      count.textContent = "01";

      eyebrow.append(platform, count);

      const comment = document.createElement("article");
      comment.className = "sinners-tiktok-comment-card";

      const avatar = document.createElement("div");
      avatar.className = "sinners-tiktok-comment-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = "TS";

      const body = document.createElement("div");
      body.className = "sinners-tiktok-comment-body";

      const identity = document.createElement("div");
      identity.className = "sinners-tiktok-comment-identity";

      const username = document.createElement("strong");
      username.textContent = "@thesinnerseurope";

      const badge = document.createElement("span");
      badge.textContent = "BRAND";

      identity.append(username, badge);

      const message = document.createElement("p");
      message.textContent = "🔥🔥🔥";
      message.setAttribute("aria-label", "Three fire emojis");

      body.append(identity, message);
      comment.append(avatar, body);
      commentSection.append(eyebrow, comment);

      const links = copy.querySelector(".case-study-links");
      if (links) copy.insertBefore(commentSection, links);
      else copy.append(commentSection);
    };

    const getCaseStudyScrollContainers = (
      modalRoot: HTMLElement | null | undefined,
      copy: HTMLElement | null | undefined,
    ) => {
      const candidates = new Set<HTMLElement>();

      const addCandidate = (element: Element | null | undefined) => {
        if (element instanceof HTMLElement) candidates.add(element);
      };

      addCandidate(copy);
      addCandidate(modalRoot);
      addCandidate(modalRoot?.closest(".project-modal"));
      addCandidate(document.querySelector(".project-modal"));

      modalRoot
        ?.querySelectorAll<HTMLElement>(
          ".case-study-copy, .case-study-layout, .case-study-content, " +
            ".project-modal-content, .project-modal-body, [role='dialog']",
        )
        .forEach(addCandidate);

      return Array.from(candidates).filter((element) => {
        const style = window.getComputedStyle(element);
        const overflowY = style.overflowY;
        const canScrollVertically =
          element.scrollHeight > element.clientHeight + 2 ||
          overflowY === "auto" ||
          overflowY === "scroll" ||
          overflowY === "overlay";

        return canScrollVertically || element.scrollTop > 0;
      });
    };

    const captureCaseStudyScrollPosition = (
      modalRoot: HTMLElement | null | undefined,
      copy: HTMLElement | null | undefined,
    ) => ({
      windowX: window.scrollX,
      windowY: window.scrollY,
      containers: getCaseStudyScrollContainers(modalRoot, copy).map(
        (element) => {
          const maximumTop = Math.max(
            0,
            element.scrollHeight - element.clientHeight,
          );

          return {
            element,
            top: element.scrollTop,
            left: element.scrollLeft,
            bottomGap: Math.max(0, maximumTop - element.scrollTop),
            wasNearBottom:
              maximumTop > 0 &&
              maximumTop - element.scrollTop <=
                Math.max(80, element.clientHeight * 0.35),
          };
        },
      ),
    });

    const restoreCaseStudyScrollPosition = (
      snapshot: ReturnType<typeof captureCaseStudyScrollPosition>,
    ) => {
      snapshot.containers.forEach((saved) => {
        if (!saved.element.isConnected) return;

        const maximumTop = Math.max(
          0,
          saved.element.scrollHeight - saved.element.clientHeight,
        );
        const nextTop = saved.wasNearBottom
          ? Math.max(0, maximumTop - saved.bottomGap)
          : Math.min(saved.top, maximumTop);

        saved.element.scrollTop = nextTop;
        saved.element.scrollLeft = saved.left;
      });

      if (window.scrollX !== snapshot.windowX || window.scrollY !== snapshot.windowY) {
        window.scrollTo(snapshot.windowX, snapshot.windowY);
      }
    };

    const getNearestCaseStudyScroller = (
      element: HTMLElement,
      boundary: HTMLElement | null | undefined,
    ) => {
      let current = element.parentElement;

      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY;
        const canScroll =
          current.scrollHeight > current.clientHeight + 2 &&
          (overflowY === "auto" ||
            overflowY === "scroll" ||
            overflowY === "overlay");

        if (canScroll) return current;
        if (current === boundary) break;
        current = current.parentElement;
      }

      const projectModal = document.querySelector<HTMLElement>(".project-modal");
      if (
        projectModal &&
        projectModal.scrollHeight > projectModal.clientHeight + 2
      ) {
        return projectModal;
      }

      return null;
    };

    const normalizeProjectTitle = (value: string | null | undefined) =>
      value?.replace(/\s+/g, " ").trim().toUpperCase() ?? "";

    const getOrderedProjectCards = () => {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>(CARD_SELECTOR),
      ).filter((card) => card.querySelector(".project-copy h3"));

      return cards.sort((first, second) => {
        const firstId = Number(
          first.className.match(/(?:^|\s)project-card-(\d+)(?:\s|$)/)?.[1] ??
            Number.POSITIVE_INFINITY,
        );
        const secondId = Number(
          second.className.match(/(?:^|\s)project-card-(\d+)(?:\s|$)/)?.[1] ??
            Number.POSITIVE_INFINITY,
        );

        return firstId - secondId;
      });
    };

    const installCaseStudyNavigation = () => {
      const heading = document.querySelector<HTMLHeadingElement>(
        CASE_STUDY_TITLE_SELECTOR,
      );

      if (!heading) return;

      const dialog = heading.closest<HTMLElement>('[role="dialog"]');
      const modalRoot = dialog ?? heading.parentElement?.parentElement?.parentElement;
      const copy = modalRoot?.querySelector<HTMLElement>(".case-study-copy");

      if (!copy) return;

      const currentTitle = normalizeProjectTitle(heading.textContent);
      const existingNavigation = copy.querySelector<HTMLElement>(
        ".case-study-project-navigation",
      );
      const cards = getOrderedProjectCards();
      const currentIndex = cards.findIndex((card) =>
        normalizeProjectTitle(
          card.querySelector<HTMLElement>(".project-copy h3")?.textContent,
        ) === currentTitle,
      );

      if (cards.length < 2 || currentIndex < 0) {
        existingNavigation?.remove();
        return;
      }

      if (existingNavigation?.dataset.currentProject === currentTitle) return;
      existingNavigation?.remove();

      const navigation = document.createElement("nav");
      navigation.className = "case-study-project-navigation";
      navigation.dataset.currentProject = currentTitle;
      navigation.setAttribute("aria-label", "Project navigation");

      const createButton = (
        label: string,
        direction: -1 | 1,
        className: string,
      ) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = label;

        const previewIndex =
          (currentIndex + direction + cards.length) % cards.length;
        const previewTitle = cards[previewIndex]
          .querySelector<HTMLElement>(".project-copy h3")
          ?.textContent?.trim();

        if (previewTitle) {
          button.setAttribute(
            "aria-label",
            `${direction < 0 ? "Previous" : "Next"} project: ${previewTitle}`,
          );
        }

        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          const liveHeading = document.querySelector<HTMLHeadingElement>(
            CASE_STUDY_TITLE_SELECTOR,
          );
          const liveCards = getOrderedProjectCards();
          const liveTitle = normalizeProjectTitle(liveHeading?.textContent);
          const liveIndex = liveCards.findIndex((card) =>
            normalizeProjectTitle(
              card.querySelector<HTMLElement>(".project-copy h3")?.textContent,
            ) === liveTitle,
          );

          if (liveIndex < 0 || liveCards.length < 2) return;

          const targetIndex =
            (liveIndex + direction + liveCards.length) % liveCards.length;
          const targetCard = liveCards[targetIndex];

          const scrollSnapshot = captureCaseStudyScrollPosition(
            modalRoot,
            copy,
          );
          const buttonViewportTop = button.getBoundingClientRect().top;

          navigation
            .querySelectorAll<HTMLButtonElement>("button")
            .forEach((navigationButton) => {
              navigationButton.disabled = true;
            });

          targetCard.click();

          const restoreNavigationPosition = () => {
            restoreCaseStudyScrollPosition(scrollSnapshot);
            installCaseStudyNavigation();

            const nextHeading = document.querySelector<HTMLHeadingElement>(
              CASE_STUDY_TITLE_SELECTOR,
            );
            const nextDialog = nextHeading?.closest<HTMLElement>('[role="dialog"]');
            const nextRoot =
              nextDialog ??
              nextHeading?.parentElement?.parentElement?.parentElement;
            const nextButton = nextRoot?.querySelector<HTMLButtonElement>(
              `.${className}`,
            );

            if (!nextButton) return;

            const scroller = getNearestCaseStudyScroller(nextButton, nextRoot);
            const positionDifference =
              nextButton.getBoundingClientRect().top - buttonViewportTop;

            if (scroller && Math.abs(positionDifference) > 1) {
              scroller.scrollTop += positionDifference;
            }

            nextButton.focus({ preventScroll: true });
          };

          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(restoreNavigationPosition);
          });

          navigationRestoreTimers.push(
            window.setTimeout(restoreNavigationPosition, 80),
            window.setTimeout(restoreNavigationPosition, 220),
          );
        });

        return button;
      };

      navigation.append(
        createButton(
          "← PREVIOUS PROJECT",
          -1,
          "case-study-project-navigation-previous",
        ),
        createButton(
          "NEXT PROJECT →",
          1,
          "case-study-project-navigation-next",
        ),
      );

      copy.append(navigation);
    };

    const installLamborghiniVideo = () => {
      const heading = Array.from(
        document.querySelectorAll<HTMLHeadingElement>(
          CASE_STUDY_TITLE_SELECTOR,
        ),
      ).find((element) =>
        element.textContent?.toUpperCase().includes(LAMBORGHINI_TITLE),
      );

      if (!heading) return;

      const dialog = heading.closest<HTMLElement>('[role="dialog"]');
      const modalRoot = dialog ?? heading.parentElement?.parentElement?.parentElement;
      const iframe = modalRoot?.querySelector<HTMLIFrameElement>("iframe");

      if (!iframe) return;

      const currentSource = iframe.getAttribute("src") ?? "";
      if (!currentSource.includes(LAMBORGHINI_DRIVE_ID)) {
        iframe.src = LAMBORGHINI_PREVIEW_URL;
        iframe.title = "Lamborghini Aventador — Cinematic Edit";
      }
    };

    const attach = () => {
      const nextGrid = document.querySelector<HTMLElement>(GRID_SELECTOR);
      if (!nextGrid) return false;

      grid = nextGrid;
      grid.classList.add(ACTIVE_CLASS);

      resizeObserver = new ResizeObserver(scheduleMeasure);
      resizeObserver.observe(grid);

      grid.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach((card) => {
        resizeObserver?.observe(card);
      });

      window.addEventListener("resize", scheduleMeasure, { passive: true });

      installHeroProfession();
      installDirectMessageLink();
      installGiveawayVersions();
      installViewBadges();
      installMichaelJordanThumbnail();
      installSinnersThumbnail();
      installTravisThumbnail();
      installSinnersComment();
      installCaseStudyNavigation();
      installLamborghiniVideo();
      scheduleMeasure();

      window.setTimeout(() => {
        installHeroProfession();
        installDirectMessageLink();
        installGiveawayVersions();
        installViewBadges();
        installMichaelJordanThumbnail();
        installSinnersThumbnail();
        installTravisThumbnail();
        installSinnersComment();
        installCaseStudyNavigation();
        installLamborghiniVideo();
        scheduleMeasure();
      }, 120);

      window.setTimeout(scheduleMeasure, 500);
      return true;
    };

    if (!attach()) {
      gridObserver = new MutationObserver(() => {
        if (attach()) gridObserver?.disconnect();
      });

      gridObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    modalObserver = new MutationObserver(() => {
      installHeroProfession();
      installDirectMessageLink();
      installViewBadges();
      installSinnersComment();
      installCaseStudyNavigation();
      installLamborghiniVideo();
    });

    modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      mounted = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", scheduleMeasure);
      resizeObserver?.disconnect();
      gridObserver?.disconnect();
      modalObserver?.disconnect();
      navigationRestoreTimers.forEach((timer) => window.clearTimeout(timer));
      viewBadgeCleanups.forEach((cleanup) => cleanup());
      installedViewBadges.forEach((badge) => badge.remove());
      restoreGiveawayStage();
      clearCardRows();
      grid?.classList.remove(ACTIVE_CLASS);
    };
  }, []);

  return (
    <style>{`
      .hero h1 .hero-profession-line {
        display: block !important;
        position: relative !important;
        z-index: 8;
        width: max-content;
        max-width: min(92vw, 760px);
        margin: clamp(8px, 1.1vw, 16px) auto 0;
        padding: 0;
        color: rgba(255, 255, 255, 0.74) !important;
        font-size: clamp(11px, 1.15vw, 16px) !important;
        font-weight: 700 !important;
        line-height: 1.15 !important;
        letter-spacing: clamp(0.12em, 0.38vw, 0.24em) !important;
        text-align: center;
        white-space: nowrap;
        transform: none !important;
        opacity: 1 !important;
        filter: none !important;
        pointer-events: none;
      }

      @media (max-width: 520px) {
        .hero h1 .hero-profession-line {
          max-width: 94vw;
          font-size: 10px !important;
          letter-spacing: 0.11em !important;
          white-space: normal;
        }
      }

      .site-footer::before,
      .site-footer::after {
        content: none !important;
        display: none !important;
      }

      /* The Hero owns the section-transition glow and particles. */
      .work-scroll-reveal {
        box-shadow: none !important;
      }

      .work-scroll-reveal::before {
        content: none !important;
        display: none !important;
        background: none !important;
        filter: none !important;
      }


      .case-study-project-navigation {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: clamp(30px, 4vw, 54px);
        padding-top: clamp(18px, 2.5vw, 28px);
        border-top: 1px solid rgba(255, 255, 255, 0.18);
      }

      .case-study-project-navigation button {
        min-height: 52px;
        padding: 15px 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: transparent;
        color: #fff;
        font: inherit;
        font-size: clamp(10px, 1vw, 12px);
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: 0.11em;
        cursor: pointer;
        transition:
          color 180ms ease,
          background-color 180ms ease,
          border-color 180ms ease,
          transform 180ms ease;
      }

      .case-study-project-navigation-previous {
        text-align: left;
      }

      .case-study-project-navigation-next {
        text-align: right;
      }

      .case-study-project-navigation button:hover,
      .case-study-project-navigation button:focus-visible {
        border-color: #14A234;
        background: #14A234;
        color: #050505;
        transform: translate3d(0, -3px, 0);
      }

      .case-study-project-navigation button:focus-visible {
        outline: 2px solid #fff;
        outline-offset: 3px;
      }


      .sinners-tiktok-comment {
        margin: clamp(24px, 3vw, 38px) 0 4px;
        padding-top: 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.16);
        animation: sinners-comment-enter 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
      }

      .sinners-tiktok-comment-eyebrow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 12px;
        font-size: 10px;
        line-height: 1;
        letter-spacing: 0.18em;
        color: rgba(255, 255, 255, 0.55);
      }

      .sinners-tiktok-comment-card {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr);
        gap: 12px;
        align-items: start;
        padding: 15px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.045);
        backdrop-filter: blur(12px);
      }

      .sinners-tiktok-comment-avatar {
        display: grid;
        place-items: center;
        width: 42px;
        aspect-ratio: 1;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.24);
        background: #0b0b0b;
        color: #fff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .sinners-tiktok-comment-body {
        min-width: 0;
      }

      .sinners-tiktok-comment-identity {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-bottom: 7px;
      }

      .sinners-tiktok-comment-identity strong {
        overflow: hidden;
        color: #fff;
        font-size: 13px;
        line-height: 1.2;
        text-overflow: ellipsis;
      }

      .sinners-tiktok-comment-identity span {
        padding: 4px 6px 3px;
        border: 1px solid rgba(20, 162, 52, 0.5);
        color: #14A234;
        font-size: 8px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: 0.12em;
      }

      .sinners-tiktok-comment-body p {
        margin: 0 !important;
        color: #fff !important;
        font-size: clamp(22px, 2.4vw, 30px) !important;
        line-height: 1.1 !important;
        letter-spacing: 0.04em;
      }

      @keyframes sinners-comment-enter {
        from {
          opacity: 0;
          transform: translate3d(0, 18px, 0) scale(0.98);
          filter: blur(8px);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }
      }

      @media (max-width: 620px) {
        .case-study-project-navigation {
          grid-template-columns: 1fr;
          gap: 9px;
        }

        .case-study-project-navigation button,
        .case-study-project-navigation-previous,
        .case-study-project-navigation-next {
          text-align: center;
        }

        .sinners-tiktok-comment-card {
          grid-template-columns: 38px minmax(0, 1fr);
          padding: 13px;
        }

        .sinners-tiktok-comment-avatar {
          width: 38px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .case-study-project-navigation button {
          transition: none;
        }

        .case-study-project-navigation button:hover,
        .case-study-project-navigation button:focus-visible {
          transform: none;
        }

        .sinners-tiktok-comment {
          animation: none;
        }
      }
    `}</style>
  );
}
