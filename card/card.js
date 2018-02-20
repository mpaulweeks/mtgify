class AutoCard extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', e => {
      this.openLink()
    });

    this.name = this.innerHTML
  }

  getName() {
    return this.name
  }

  openLink() {
    console.log(this)
  }
}

customElements.define('auto-card', AutoCard);
