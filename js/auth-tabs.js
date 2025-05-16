document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            //update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            //show form
            authForms.forEach(form => {
                form.classList.remove('active');
                if(form.getAttribute('data-tab')===tabId){
                    form.classList.add('active');
                }
            });
        });
    });
});