/* script.js — Big Planetarium
 * Components: planet filter and tabs,
 * accordion and form validation.
 * Each init function exits early if its elements aren't on the page. */

/* Planet filter — toggles card visibility by data-type and announces
 * the count via the #filter-status aria-live region. */
function initPlanetFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    const cards = document.querySelectorAll('.planet-card');
    const statusEl = document.getElementById('filter-status');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            filterBtns.forEach(b => {
                b.setAttribute('aria-pressed', 'false');
                b.classList.remove('active');
            });
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.add('active');

            /* classList.toggle avoids the hidden-attribute vs. display:flex conflict */
            let visible = 0;
            cards.forEach(card => {
                const show = filter === 'all' || card.dataset.type === filter;
                card.classList.toggle('hidden', !show);
                if (show) visible++;
            });

            if (statusEl) {
                const label = filter === 'all' ? '' : ` ${filter.replace('-', ' ')}`;
                statusEl.textContent =
                    `Showing ${visible}${label} planet${visible !== 1 ? 's' : ''}.`;
            }
        });
    });
}

/* Tabs — WAI-ARIA tab pattern with roving tabindex.
 * Arrow keys move focus between tabs; Tab reaches the panel.
 * Reference: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ */
function initTabs() {
    const tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return;

    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
    const panels = document.querySelectorAll('[role="tabpanel"]');

    function activateTab(tab) {
        tabs.forEach(t => {
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });
        panels.forEach(p => p.classList.add('hidden'));

        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');

        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.classList.remove('hidden');
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activateTab(tab));

        tab.addEventListener('keydown', e => {
            let next;
            if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
            else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
            else if (e.key === 'Home') next = tabs[0];
            else if (e.key === 'End') next = tabs[tabs.length - 1];
            else return;

            e.preventDefault();
            activateTab(next);
            next.focus();
        });
    });
}

/* Accordion — toggles aria-expanded and panel visibility. */
function initAccordion() {
    const btns = document.querySelectorAll('.accordion-btn');
    if (!btns.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            const panel = document.getElementById(btn.getAttribute('aria-controls'));
            const icon = btn.querySelector('.accordion-icon');

            btn.setAttribute('aria-expanded', String(!expanded));
            if (panel) panel.classList.toggle('hidden');
            if (icon) icon.textContent = expanded ? '+' : '−';
        });
    });
}

/* Form validation — marks fields aria-invalid, injects error messages
 * linked by aria-describedby, and focuses the first invalid field. */
function initForm() {
    const form = document.getElementById('enquiry-form');
    if (!form) return;

    const successEl = document.getElementById('form-success');

    form.addEventListener('submit', e => {
        e.preventDefault();

        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('[aria-invalid]').forEach(field => {
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
        });

        let firstInvalid = null;

        form.querySelectorAll('[required]').forEach(field => {
            let msg = null;

            if (!field.value.trim()) {
                const labelText = field.labels[0]?.textContent.replace('*', '').trim()
                    ?? 'This field';
                msg = `${labelText} is required.`;
            } else if (field.type === 'email'
                && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                msg = 'Please enter a valid email address.';
            }

            if (msg) {
                const errorId = `${field.id}-error`;
                field.setAttribute('aria-invalid', 'true');
                field.setAttribute('aria-describedby', errorId);

                const errEl = document.createElement('span');
                errEl.id = errorId;
                errEl.className = 'field-error';
                errEl.setAttribute('role', 'alert');
                errEl.textContent = msg;
                field.after(errEl);

                if (!firstInvalid) firstInvalid = field;
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        form.hidden = true;
        if (successEl) {
            successEl.classList.remove('hidden');
            successEl.focus();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initPlanetFilter();
    initTabs();
    initAccordion();
    initForm();
});
