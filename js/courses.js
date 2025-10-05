// courses.js
const courseFilter = document.getElementById('courseFilter');
const courseList = document.querySelectorAll('#courseList .course');

function applyCourseFilter(){
    const selected = courseFilter ? courseFilter.value : 'all';
    courseList.forEach(course => {
        const show = selected === 'all' || course.dataset.skill === selected;
        course.style.display = show ? 'block' : 'none';
        course.classList.toggle('fade-in', show);
    });
}

if (courseFilter) courseFilter.addEventListener('change', applyCourseFilter);
applyCourseFilter();
