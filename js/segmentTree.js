// js/segmentTree.js
class SegNode {
  constructor(l, r) {
    this.l = l; // 区间左端点
    this.r = r; // 区间右端点
    this.val = 0; // 用户自定义维护信息
    this.lazy = 0; // 懒标记
    this.leftChild = null;
    this.rightChild = null;
  }
}

class SegmentTree {
  constructor(arr, pushupFn, pushdownFn) {
    this.n = arr.length;
    this.arr = [...arr];
    this.pushup = pushupFn;
    this.pushdown = pushdownFn;
    this.root = this.build(0, this.n - 1);
    this.highlightNodes = []; // 保存当前访问节点，用于绘图高亮
  }

  build(l, r) {
    const node = new SegNode(l, r);
    if (l === r) {
      node.val = this.arr[l];
      return node;
    }
    const mid = Math.floor((l + r) / 2);
    node.leftChild = this.build(l, mid);
    node.rightChild = this.build(mid + 1, r);
    this.pushup(node, node.leftChild, node.rightChild);
    return node;
  }

  // 区间修改：区间 [ul, ur] + val
  rangeAdd(node, ul, ur, val) {
    this.highlightNodes.push(node);
    if (node.r < ul || node.l > ur) return;
    if (ul <= node.l && node.r <= ur) {
      node.val += val;
      node.lazy += val;
      return;
    }
    this.pushdown(node, node.leftChild, node.rightChild);
    this.rangeAdd(node.leftChild, ul, ur, val);
    this.rangeAdd(node.rightChild, ul, ur, val);
    this.pushup(node, node.leftChild, node.rightChild);
  }

  // 区间查询 [ql, qr]
  rangeQuery(node, ql, qr) {
    this.highlightNodes.push(node);
    if (node.r < ql || node.l > qr) return 0;
    if (ql <= node.l && node.r <= qr) {
      return node.val;
    }
    this.pushdown(node, node.leftChild, node.rightChild);
    const lv = this.rangeQuery(node.leftChild, ql, qr);
    const rv = this.rangeQuery(node.rightChild, ql, qr);
    // 查询也要调用pushup合并结果（和你自定义逻辑对齐）
    const fakeParent = new SegNode(0,0);
    this.pushup(fakeParent, {val:lv}, {val:rv});
    return fakeParent.val;
  }

  clearHighlight() {
    this.highlightNodes = [];
  }
}

// 全局变量
let tree = null;
let canvas = document.getElementById('treeCanvas');
let ctx = canvas.getContext('2d');

// 绑定页面按钮
function rebuildTree() {
  const n = parseInt(document.getElementById('inputN').value);
  const initStr = document.getElementById('initArr').value;
  const arr = initStr.split(',').map(Number).slice(0, n);
  const pushupCode = document.getElementById('codePushup').value;
  const pushdownCode = document.getElementById('codePushdown').value;
  const pu = compilePushup(pushupCode);
  const pd = compilePushdown(pushdownCode);
  if (!pu || !pd) return;
  tree = new SegmentTree(arr, pu, pd);
  renderTree(tree, ctx, canvas.width, canvas.height);
}

document.getElementById('btnRebuild').onclick = rebuildTree;

document.getElementById('btnRangeAdd').onclick = () => {
  const l = +document.getElementById('opL').value;
  const r = +document.getElementById('opR').value;
  const v = +document.getElementById('opVal').value;
  if(!tree) return;
  tree.clearHighlight();
  tree.rangeAdd(tree.root, l, r, v);
  renderTree(tree, ctx, canvas.width, canvas.height);
  document.getElementById('output').textContent = `区间加 [${l},${r}] += ${v}`;
};

document.getElementById('btnQuery').onclick = () => {
  const l = +document.getElementById('opL').value;
  const r = +document.getElementById('opR').value;
  if(!tree) return;
  tree.clearHighlight();
  const res = tree.rangeQuery(tree.root, l, r);
  renderTree(tree, ctx, canvas.width, canvas.height);
  document.getElementById('output').textContent = `查询[${l},${r}] = ${res}`;
};

// 页面加载自动构建一次
window.onload = rebuildTree;
