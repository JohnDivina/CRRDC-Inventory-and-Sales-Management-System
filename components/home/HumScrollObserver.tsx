"use client";

import { useEffect } from "react";

export default function HumScrollObserver() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Header floating scroll morph (.masthead)
    const masthead = document.querySelector<HTMLElement>(".masthead");
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (masthead) {
            if (window.scrollY > 24) {
              masthead.classList.add("is-floating");
              masthead.setAttribute("data-scrolled", "true");
            } else {
              masthead.classList.remove("is-floating");
              masthead.setAttribute("data-scrolled", "false");
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // 2. Stage reveal animation via IntersectionObserver
    const stages = Array.from(document.querySelectorAll<HTMLElement>(".hum-stage"));

    if ("IntersectionObserver" in window) {
      const ioStage = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              ioStage.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
      );

      stages.forEach((stage) => ioStage.observe(stage));

      // 3. Counter tick-up animation via IntersectionObserver
      const counters = Array.from(document.querySelectorAll<HTMLElement>(".hum-count"));

      const ioCount = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const el = e.target as HTMLElement;
              runCounter(el, reduceMotion);
              ioCount.unobserve(el);
            }
          });
        },
        { threshold: 0.4 }
      );

      counters.forEach((c) => ioCount.observe(c));

      return () => {
        window.removeEventListener("scroll", handleScroll);
        ioStage.disconnect();
        ioCount.disconnect();
      };
    } else {
      stages.forEach((s) => s.classList.add("is-in"));
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}

function runCounter(el: HTMLElement, reduceMotion: boolean) {
  const targetVal = parseInt(el.dataset.to || el.textContent || "0", 10) || 0;
  if (reduceMotion) {
    el.textContent = targetVal.toLocaleString("en-US");
    return;
  }

  const duration = 1200;
  const startTime = performance.now();

  function tick(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out curve
    const currentVal = Math.round(targetVal * eased);

    el.textContent = currentVal.toLocaleString("en-US");

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = targetVal.toLocaleString("en-US");
      if (el.animate) {
        el.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.12)" },
            { transform: "scale(1)" },
          ],
          { duration: 320, easing: "ease-out" }
        );
      }
    }
  }

  requestAnimationFrame(tick);
}
