<template>
  <div id="app">
    <HeaderComponent />
    <main>
      <router-view />
    </main>
    <NavigationButtons />
  </div>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue'
import NavigationButtons from './components/NavigationButtons.vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    NavigationButtons
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc;
  color: #333;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  min-height: calc(100vh - 120px);
  flex: 1;
  padding-top: 0;
}
</style>