<template>
  <v-collapse-wrapper v-on:beforeClose="my_custom_action">
		<div class="header" v-collapse-toggle>
		  Click me to toggle content
		</div>
		<div class="my-content" v-collapse-content>
	  	This is hiddend content
		</div>
  </v-collapse-wrapper>
</template>

<script></script>

<style></style>
