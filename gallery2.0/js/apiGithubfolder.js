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



const app = new Vue({
  el: '#app',
  data: {
    items: []
  },
  mounted() {
    // 💡 Alterne para 'false' quando for subir o projeto para o GitHub
    const MODO_LOCAL = false; 

  if (MODO_LOCAL) {
    const fotosLocais = [
      '1alice.jpg',
      '2garage band.jpg',
      '3-random3.png',
      '1-.jpg'
    ];

    const files = fotosLocais.map(nome => ({
      name: nome,
      // 1. Tente assim se a pasta 'img' estiver dentro de gallery2.0/
      download_url: `../gallery/img/conteudo/${encodeURIComponent(nome)}` 
      
      // 2. OU se a pasta 'img' estiver na raiz fora do gallery2.0, use assim:
      // download_url: `../gallery/img/conteudo/${nome}`
    }));

    this.processarEInserirImagens(files);
    } else {
      // Carrega direto do GitHub
      const USUARIO = 'rafalobodev';
      const REPOSITORIO = 'gallery';
      const CAMINHO_PASTA = 'gallery/img/conteudo';

      fetch(`https://api.github.com/repos/${USUARIO}/${REPOSITORIO}/contents/${CAMINHO_PASTA}`)
        .then(res => res.json())
        .then(files => {
          if (!Array.isArray(files)) return;
          this.processarEInserirImagens(files);
        })
        .catch(err => console.error('Erro ao carregar do GitHub:', err));
    }
  },
  methods: {
    processarEInserirImagens(files) {
      // 1. Filtra só extensões de imagem
      const imagens = files.filter(f => f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));

      // 2. Extrai número antes do primeiro hífen para ordenar (1, 2, 19, 24...)
      const extrairNumero = (nome) => {
        const prefixo = nome.split('-')[0];
        const numero = prefixo.replace(/\D/g, '');
        return numero ? parseInt(numero, 10) : 0;
      };

      imagens.sort((a, b) => extrairNumero(a.name) - extrairNumero(b.name));

      // 3. Mapeia para o formato que seu template exige
      this.items = imagens.map((file, index) => {
        const nomeSemExtensao = file.name.substring(0, file.name.lastIndexOf('.'));
        const indexHifen = nomeSemExtensao.indexOf('-');

        let numero = '';
        let titulo = '';

        if (indexHifen !== -1) {
          numero = nomeSemExtensao.substring(0, indexHifen).replace(/\D/g, '').trim();
          titulo = nomeSemExtensao.substring(indexHifen + 1).trim();
        } else {
          numero = nomeSemExtensao.replace(/\D/g, '').trim();
          titulo = nomeSemExtensao.replace(/[0-9]/g, '').trim();
        }

        if (!titulo || (titulo.length > 20 && !titulo.includes(' '))) {
          titulo = '...';
        } else {
          titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);
        }

        return {
          id: file.sha || `local-${index}`,
          image: file.download_url,
          title: titulo,
          description: numero ? `pic nº ${numero}` : 'pic'
        };
      });
    }
  }
});