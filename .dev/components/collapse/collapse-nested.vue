<template>
	<v-collapse-wrapper>
    <div class="header" v-collapse-toggle>
      Click me to toggle content
    </div>
    <div class="content" v-collapse-content>
      <v-collapse-wrapper>
        <div class="header" v-collapse-toggle>
          Click toggle to toggle content
        </div>
        <div class="content" v-collapse-content>
          This is hiddend content
        </div>
      </v-collapse-wrapper>
    </div>
	</v-collapse-wrapper>
</template>

<script></script>

<style></style>
