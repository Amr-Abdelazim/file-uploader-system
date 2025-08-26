class TrieNode {
    constructor(folderId) {
        this.childs = {};
        this.isEnd = false;
        this.folderId = folderId;
    }
}

class Trie {
    constructor(rootId) {

        this.root = new TrieNode(rootId);
    }

    async addPathArray(path, createFolder) {
        let cur = this.root;
        for (const folder of path) {
            if (!cur.childs[folder]) {
                const folderId = await createFolder(cur.folderId, folder);
                cur.childs[folder] = new TrieNode(folderId);
            }
            cur = cur.childs[folder];
        }
        cur.isEnd = true;
        return cur.folderId;
    }

}

export default Trie;