<template>
	<v-collapse-group :onlyOneActive="true">
		<v-collapse-wrapper>
	    <div class="header" v-collapse-toggle>
        Click me to toggle content A
	    </div>
	    <div class="my-content" v-collapse-content>
        This is hiddend content A
	    </div>
		</v-collapse-wrapper>
		<v-collapse-wrapper>
	    <div class="header" v-collapse-toggle>
        Click me to toggle content B
	    </div>
	    <div class="my-content" v-collapse-content>
        This is hiddend content B
	    </div>
		</v-collapse-wrapper>
	</v-collapse-group>
</template>

<script></script>

<style></style>
