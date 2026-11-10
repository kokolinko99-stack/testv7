"use client";

import { useEffect } from "react";

type HistoryRecord = Record<string, unknown>;

const asRecord = (value: unknown): HistoryRecord =>
  value && typeof value === "object" ? (value as HistoryRecord) : {};

const isProjectModalState = (value: unknown) =>
  Boolean(asRecord(value).thrtysixProjectModal);

const isLightboxState = (value: unknown) =>
  Boolean(asRecord(value).thrtysixProjectLightbox);

export default function ModalHistoryGuard() {
  useEffect(() => {
    const historyObject = window.history;
    const originalPushState = historyObject.pushState;
    const originalReplaceState = historyObject.replaceState;
    const sessionId = `thrtysix-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    let modalSessionActive = Boolean(
      document.querySelector(".project-modal") ||
        isProjectModalState(historyObject.state),
    );
    let lightboxHistoryActive = Boolean(
      document.querySelector(".project-image-lightbox") ||
        isLightboxState(historyObject.state),
    );
    let allowingNativeLightboxClose = false;
    let closeFallbackTimer = 0;

    const replaceState = (
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) => {
      originalReplaceState.call(
        historyObject,
        data,
        unused,
        url ?? window.location.href,
      );
    };

    const pushState = (
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) => {
      originalPushState.call(
        historyObject,
        data,
        unused,
        url ?? window.location.href,
      );
    };

    const makeModalState = (data: unknown) => ({
      ...asRecord(historyObject.state),
      ...asRecord(data),
      thrtysixProjectModal: true,
      thrtysixProjectLightbox: false,
      thrtysixModalSession: sessionId,
    });

    const patchedPushState: History["pushState"] = function (
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      if (!isProjectModalState(data)) {
        pushState(data, unused, url);
        return;
      }

      const modalIsVisible = Boolean(document.querySelector(".project-modal"));
      const nextState = makeModalState(data);

      if (
        modalSessionActive ||
        modalIsVisible ||
        isProjectModalState(historyObject.state)
      ) {
        modalSessionActive = true;
        replaceState(nextState, unused, url);
        return;
      }

      modalSessionActive = true;
      pushState(nextState, unused, url);
    };

    historyObject.pushState = patchedPushState;

    const dispatchCloseState = () => {
      window.dispatchEvent(
        new PopStateEvent("popstate", {
          state: {
            ...asRecord(historyObject.state),
            thrtysixProjectModal: false,
            thrtysixProjectLightbox: false,
          },
        }),
      );
    };

    const clickNativeLightboxClose = () => {
      const closeButton = document.querySelector<HTMLButtonElement>(
        ".project-image-lightbox-close",
      );

      if (!closeButton) return;

      allowingNativeLightboxClose = true;
      closeButton.click();
      window.queueMicrotask(() => {
        allowingNativeLightboxClose = false;
      });
    };

    const closeLightbox = () => {
      if (!document.querySelector(".project-image-lightbox")) return;

      if (isLightboxState(historyObject.state)) {
        historyObject.back();
        return;
      }

      lightboxHistoryActive = false;
      clickNativeLightboxClose();
    };

    const closeProjectModal = () => {
      if (document.querySelector(".project-image-lightbox")) {
        closeLightbox();
        return;
      }

      if (!document.querySelector(".project-modal")) return;

      window.clearTimeout(closeFallbackTimer);

      if (isProjectModalState(historyObject.state)) {
        historyObject.back();

        closeFallbackTimer = window.setTimeout(() => {
          if (document.querySelector(".project-modal")) {
            dispatchCloseState();
          }
        }, 90);
      } else {
        dispatchCloseState();
      }
    };

    const installLightboxHistoryEntry = () => {
      const lightboxIsVisible = Boolean(
        document.querySelector(".project-image-lightbox"),
      );

      if (!lightboxIsVisible || lightboxHistoryActive) return;

      lightboxHistoryActive = true;
      modalSessionActive = true;

      pushState(
        {
          ...asRecord(historyObject.state),
          thrtysixProjectModal: true,
          thrtysixProjectLightbox: true,
          thrtysixModalSession: sessionId,
        },
        "",
        window.location.href,
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      const hasLightbox = Boolean(
        document.querySelector(".project-image-lightbox"),
      );
      const hasProjectModal = Boolean(document.querySelector(".project-modal"));

      if (!hasLightbox && !hasProjectModal) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (hasLightbox) {
        closeLightbox();
        return;
      }

      closeProjectModal();
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const imageButton = target.closest<HTMLButtonElement>(
        ".campaign-image-button",
      );

      /*
       * Add the lightbox entry before React mounts the overlay. This removes
       * the tiny race where a very fast Back press could consume the modal
       * entry before the MutationObserver sees the lightbox.
       */
      if (imageButton && !lightboxHistoryActive) {
        lightboxHistoryActive = true;
        modalSessionActive = true;
        pushState(
          {
            ...asRecord(historyObject.state),
            thrtysixProjectModal: true,
            thrtysixProjectLightbox: true,
            thrtysixModalSession: sessionId,
          },
          "",
          window.location.href,
        );
      }

      const lightboxClose = target.closest<HTMLButtonElement>(
        ".project-image-lightbox-close",
      );

      if (lightboxClose && !allowingNativeLightboxClose) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeLightbox();
        return;
      }

      const projectClose = target.closest<HTMLButtonElement>(
        ".project-modal .modal-close",
      );

      if (!projectClose) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      closeProjectModal();
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (!target.classList.contains("project-image-lightbox")) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      closeLightbox();
    };

    const handlePopState = (event: PopStateEvent) => {
      window.clearTimeout(closeFallbackTimer);

      const lightboxIsVisible = Boolean(
        document.querySelector(".project-image-lightbox"),
      );

      /*
       * The lightbox owns one history entry above the case-study entry.
       * Consuming it must close only the lightbox and must not reach the
       * PortfolioExperience popstate listener, which would close the project.
       */
      if (lightboxIsVisible) {
        event.stopImmediatePropagation();
        lightboxHistoryActive = false;
        modalSessionActive = true;
        clickNativeLightboxClose();
        return;
      }

      lightboxHistoryActive = false;
      modalSessionActive = false;
    };

    const observer = new MutationObserver(() => {
      const modalIsVisible = Boolean(document.querySelector(".project-modal"));
      const lightboxIsVisible = Boolean(
        document.querySelector(".project-image-lightbox"),
      );

      if (lightboxIsVisible) {
        installLightboxHistoryEntry();
      } else if (!isLightboxState(historyObject.state)) {
        lightboxHistoryActive = false;
      }

      if (modalIsVisible) {
        modalSessionActive = true;
        return;
      }

      modalSessionActive = false;
      lightboxHistoryActive = false;

      if (isProjectModalState(historyObject.state)) {
        replaceState(
          {
            ...asRecord(historyObject.state),
            thrtysixProjectModal: false,
            thrtysixProjectLightbox: false,
            thrtysixModalSession: undefined,
          },
          "",
          window.location.href,
        );
      }
    });

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("mousedown", handleMouseDown, true);
    window.addEventListener("popstate", handlePopState, true);
    observer.observe(document.body, { childList: true, subtree: true });

    installLightboxHistoryEntry();

    return () => {
      window.clearTimeout(closeFallbackTimer);
      observer.disconnect();
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("mousedown", handleMouseDown, true);
      window.removeEventListener("popstate", handlePopState, true);

      if (historyObject.pushState === patchedPushState) {
        historyObject.pushState = originalPushState;
      }
    };
  }, []);

  return null;
}
