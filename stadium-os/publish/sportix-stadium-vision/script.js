document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('open');
    });
    // Close on link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Beneficiary tabs
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Analysis example tabs
  const examples = {
    spaces: {
      title: 'مساحات خلف الطرف أثناء التحول الدفاعي',
      desc: 'مثال توضيحي لملاحظة فنية مرتبطة بلقطة. يراجعها المحلل والمدرب ضمن سياق المباراة.',
      badge: 'قيد المراجعة'
    },
    press: {
      title: 'ضغط غير متوازن في منتصف الملعب',
      desc: 'مثال توضيحي على نمط ضغط يُراجع مع الجهاز الفني لتحديد أولوية تدريبية.',
      badge: 'قيد المراجعة'
    },
    setpiece: {
      title: 'روتين كرة ثابتة هجومية متكرر',
      desc: 'مثال توضيحي لمراجعة نمط في الكرات الثابتة لدعم تحضير المباراة.',
      badge: 'قيد المراجعة'
    }
  };

  const analysisTabs = document.querySelectorAll('.analysis-tab');
  const exampleTitle = document.getElementById('example-title');
  const exampleDesc = document.getElementById('example-desc');
  const exampleBadge = document.querySelector('.example-badge');

  analysisTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      analysisTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const key = tab.dataset.example;
      const data = examples[key];
      if (data && exampleTitle && exampleDesc && exampleBadge) {
        exampleTitle.textContent = data.title;
        exampleDesc.textContent = data.desc;
        exampleBadge.textContent = data.badge;
      }
    });
  });

  // Secondary analysis views
  const secTabs = document.querySelectorAll('.sec-tab');
  const secContents = document.querySelectorAll('.sec-content');
  secTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      secTabs.forEach(t => t.classList.remove('active'));
      secContents.forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      const view = tab.dataset.view;
      const target = document.getElementById('sec-' + view);
      if (target) target.classList.remove('hidden');
    });
  });

  // Contact form - prepare and copy
  const form = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  if (form && formMessage) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: form.name.value.trim(),
        org: form.org.value.trim(),
        type: form.type.value,
        email: form.email.value.trim(),
        goal: form.goal.value.trim()
      };

      const text = `طلب مناقشة تجربة SPORTIX STADIUM VISION

الاسم: ${data.name}
الجهة: ${data.org}
نوع الجهة: ${data.type}
البريد المهني: ${data.email}
هدف التجربة: ${data.goal}

---
تم التجهيز من البورتفوليو. لا يوجد إرسال تلقائي متصل. يُرجى إرسال هذه التفاصيل يدويًا.`;

      try {
        await navigator.clipboard.writeText(text);
        formMessage.textContent = 'تم تجهيز الطلب ونسخ التفاصيل إلى الحافظة. يمكنك لصقها في بريدك أو إرسالها يدويًا. لا يوجد إرسال تلقائي متصل حاليًا.';
        formMessage.classList.add('success');
        form.reset();
      } catch (err) {
        formMessage.textContent = 'تعذر النسخ تلقائيًا. يُرجى تحديد النص ونسخه يدويًا. لا يوجد إرسال تلقائي متصل حاليًا.';
        formMessage.classList.remove('success');
        // Fallback: show the text
        const pre = document.createElement('pre');
        pre.textContent = text;
        pre.style.cssText = 'background:#1a2630;padding:12px;border-radius:8px;margin-top:12px;font-size:13px;white-space:pre-wrap;direction:ltr;text-align:left;';
        formMessage.after(pre);
      }
    });
  }
});