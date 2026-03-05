(function () {
	const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

	function animateCounter(el, target, suffix, startVal, duration) {
		let startTime = null;
		const range = target - startVal;

		function step(timestamp) {
			if (!startTime) startTime = timestamp;
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeOutQuart(progress);
			const current = Math.round(startVal + range * eased);
			// Меняем только текстовый узел, не трогая сам элемент
			el.firstChild.nodeValue = current + suffix;
			if (progress < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	function findTextTarget(el) {
		// Ищем самый глубокий элемент с текстом-числом
		const candidates = el.querySelectorAll("span, h1, h2, h3, h4, h5, h6, p");

		for (const candidate of candidates) {
			// Берём только элементы где firstChild — текстовый узел с числом
			if (
				candidate.firstChild &&
				candidate.firstChild.nodeType === Node.TEXT_NODE &&
				/\d+/.test(candidate.firstChild.nodeValue)
			) {
				return candidate;
			}
		}

		// Fallback — сам элемент если в нём текстовый узел
		if (
			el.firstChild?.nodeType === Node.TEXT_NODE &&
			/\d+/.test(el.firstChild.nodeValue)
		) {
			return el;
		}

		return null;
	}

	document.addEventListener("DOMContentLoaded", () => {
		const elements = document.querySelectorAll(".animate-num");
		if (!elements.length) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;

					const el = entry.target;
					const target = findTextTarget(el);
					if (!target) return;

					const raw = target.firstChild.nodeValue.trim();
					const match = raw.match(/(\d+)/);
					if (!match) return;

					const number = parseInt(match[1], 10);
					const suffix = raw.slice(raw.indexOf(match[1]) + match[1].length);
					const duration = parseInt(el.dataset.duration, 10) || 5000;
					const startVal = parseInt(el.dataset.start, 10) || 0;

					// Анимируем только текстовый узел — стили span не трогаем
					const textNode = target.firstChild;
					let startTime = null;
					const range = number - startVal;

					function step(timestamp) {
						if (!startTime) startTime = timestamp;
						const elapsed = timestamp - startTime;
						const progress = Math.min(elapsed / duration, 1);
						const eased = easeOutQuart(progress);
						const current = Math.round(startVal + range * eased);
						textNode.nodeValue = current + suffix;
						if (progress < 1) requestAnimationFrame(step);
					}

					requestAnimationFrame(step);
					observer.unobserve(el);
				});
			},
			{
				threshold: 0.2,
			},
		);

		elements.forEach((el) => observer.observe(el));
	});
})();
