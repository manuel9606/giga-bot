window.onload = function() {
    const posts = document.querySelectorAll('.post');
    let currentPostIndex = 0;

    function showPost(index) {
      posts.forEach(post => post.classList.remove('active'));
      posts[index].classList.add('active');
    }

    function nextPost() {
      currentPostIndex = (currentPostIndex + 1) % posts.length;
      showPost(currentPostIndex);
    }

    function prevPost() {
      currentPostIndex = (currentPostIndex - 1 + posts.length) % posts.length;
      showPost(currentPostIndex);
    }

    showPost(currentPostIndex);

    setInterval(nextPost, 2000);

    // Event listeners para los botones prev y next
    document.querySelector('.prev').addEventListener('click', prevPost);
    document.querySelector('.next').addEventListener('click', nextPost);
  };


  $(document).ready(function(){
    $('.slick-carousel').slick({
        autoplay: true,
        autoplaySpeed: 3000,
        dots: true,
        arrows: false,
        infinite: true,
        speed: 500,
        fade: true,
        cssEase: 'linear'
    });
});