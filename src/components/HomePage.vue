<template>
  <div>
    <router-link to="/">
      <div class="relative">
        <video autoplay muted loop class="video">
          <source src="../video/4413-179384184_small.mp4" type="video/mp4">
        </video>
        <div class="absolute">
          <p class="font">Factory2</p>
          <p class="font">System</p>
        </div>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
@font-face {
  font-family: "Rockville";
  src: url("../font/Rockville Solid.otf") format("truetype");
}
.font {
  font-family: "Rockville";
}
.relative {
  position: relative;
}
.video {
  width: 100%;
  height: 93vh;
  object-fit: cover;
}
.absolute {
  position: absolute;
  top: 50%; /* 上から50%の位置に配置 */
  left: 22%; /* 左から50%の位置に配置 */
  transform: translate(-50%, -50%); /* 中央寄せ */
  font-size: 180px;
  color: white; /* 文字色を白に */
  z-index: 10; /* 動画よりも前面に表示 */
}
</style>