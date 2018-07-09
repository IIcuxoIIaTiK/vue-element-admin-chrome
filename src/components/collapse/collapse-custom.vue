<template>
	<button v-collapse-toggle="'toggle_first'">Toggle first element</button>
	<button v-collapse-toggle="'toggle_second'">Toggle second element</button>

	<v-collapse-wrapper ref="toggle_first">
    <div class="my-content" v-collapse-content>
      This is hiddend content
    </div>
	</v-collapse-wrapper>
	<v-collapse-wrapper ref="toggle_second">
    <div class="content" v-collapse-content>
      This is hiddend content
    </div>
	</v-collapse-wrapper>
</template>

<script></script>

<style></style>
