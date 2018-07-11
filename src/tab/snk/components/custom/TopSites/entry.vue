<template>
  <div class="tile" v-bind:style="{ background: topSite.color}" :aria-label="topSite.title">
    <a v-bind:href="topSite.url">
      {{topSite.character}}
      <span class="title">
        {{topSite.title}}
      </span>
    </a>
  </div>
</template>

<script>
  export default {
    name: 'TopSiteEntry',
    props: ['topSite']
  }
</script>

<style>
  .tile {
    background: rgba(0,0,0,0.1);
    height: 120px;
    width: 120px;
    position: relative;
    transition: transform 100ms ease;
  }

  .tile:active {
    transform: scale(0.97);
  }

  a {
    display: block;
    text-decoration: none;
    height: 100%;
    width: 100%;
    text-align: center;
    font-size: 65px;
    line-height: 100px;
    font-weight: bold;
    color: #fff;
  }

  .title {
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 100%;
    font-size: 13px;
    height: 25px;
    line-height: 25px;
    background: rgba(0,0,0,0.1);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-left: 5px;
    padding-right: 5px;
    box-sizing: border-box;
  }
</style>
