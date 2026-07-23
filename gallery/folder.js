Vue.config.devtools = true;

Vue.component('card', {
  template: `
    <div class="card-wrap"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      ref="card">
      <div class="card"
        :style="cardStyle">
        <div class="card-bg" :style="[cardBgTransform, cardBgImage]"></div>
        <div class="card-info">
          <slot name="header"></slot>
          <slot name="content"></slot>
        </div>
      </div>
    </div>`,
  mounted() {
    this.width = this.$refs.card.offsetWidth;
    this.height = this.$refs.card.offsetHeight;
  },
  props: ['dataImage'],
  data: () => ({
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
    mouseLeaveDelay: null }),

  computed: {
    mousePX() {
      return this.mouseX / this.width;
    },
    mousePY() {
      return this.mouseY / this.height;
    },
    cardStyle() {
      const rX = this.mousePX * 30;
      const rY = this.mousePY * -30;
      return {
        transform: `rotateY(${rX}deg) rotateX(${rY}deg)` };

    },
    cardBgTransform() {
      const tX = this.mousePX * -40;
      const tY = this.mousePY * -40;
      return {
        transform: `translateX(${tX}px) translateY(${tY}px)` };

    },
    cardBgImage() {
      return {
        backgroundImage: `url(${this.dataImage})` };

    } },

  methods: {
    handleMouseMove(e) {
      this.mouseX = e.pageX - this.$refs.card.offsetLeft - this.width / 2;
      this.mouseY = e.pageY - this.$refs.card.offsetTop - this.height / 2;
    },
    handleMouseEnter() {
      clearTimeout(this.mouseLeaveDelay);
    },
    handleMouseLeave() {
      this.mouseLeaveDelay = setTimeout(() => {
        this.mouseX = 0;
        this.mouseY = 0;
      }, 1000);
    } } });



// Instância principal do Vue
const app = new Vue({
  el: '#app',
  data: {
    items: []
  },
  mounted() {
    const USUARIO = 'rafalobodev';
    const REPOSITORIO = 'gallery';
    const CAMINHO_PASTA = 'gallery/img/conteudo'; // Caminho dentro do seu repositório

    fetch(`https://api.github.com/repos/${USUARIO}/${REPOSITORIO}/contents/${CAMINHO_PASTA}`)
      .then(res => res.json())
      .then(files => {
        if (!Array.isArray(files)) return;

        // Filtra só arquivos que são imagens
        const imagens = files.filter(f => f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));

        this.items = imagens.map(file => {
          // Exemplo de arquivo: "1-Art.jpg" ou "2-Places.png"
          const nomeSemExtensao = file.name.split('.')[0]; 
          const partes = nomeSemExtensao.split('-'); 
          
          const numero = partes[0]; // "1"
          const titulo = partes[1] || '...'; // "Art" ou "Places"

          return {
            id: file.sha,
            image: file.download_url, // Baixa a imagem diretamente do GitHub
            title: titulo,
            description: `pic nº ${numero}`
          };
        });
      })
      .catch(err => console.error('Erro ao carregar imagens do GitHub:', err));
  }
});