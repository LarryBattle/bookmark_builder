class BookmarkBuilder {
  constructor() {
    this.root = [];
    this.links = this.root;
    this.prevLinks = [];
  }

  addFolder(name) {
    if (!name) {
      throw new Error("Name is required to add a folder");
    }
    const newRow = { name, children: [] };
    this.links.push(newRow);
    this.prevLinks.push(this.links);
    this.links = newRow.children;
    return this;
  }
  endFolder() {
    if (0 < this.prevLinks.length) {
      this.links = this.prevLinks.pop();
      return this;
    }
    this.links = this.root;
    return this;
  }
  goToRoot(){
    this.links = this.prevLinks[0];
    this.prevLinks = [];
    return this;
  }
  computeLinks(items, createLinkFn) {
    this.addLinks(items.map(createLinkFn));
    return this;
  }
  addLinks(links) {
    this.links.push(...links);

    return this;
  }
  addLink(name, href) {
    this.links.push({ name, href })
    return this;
  }
  addFolders(names) {
    names.forEach( name => {
      this.addFolder(name);
    });
    return this;
  }
  reset() {
    this.root = [];
    this.links = null;
    this.prevLinks = null;
    return this;
  }
  build() {
    const out = JSON.parse(JSON.stringify(this.root));
    this.reset();
    return out;
  }

}


module.exports = BookmarkBuilder;