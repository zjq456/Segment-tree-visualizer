// js/renderer.js
let animId = null;
let startTime = Date.now();

function renderTree(tree, ctx, W, H) {
  // 取消上一轮动画
  if (animId) cancelAnimationFrame(animId);
  startTime = Date.now();

  function animate() {
    const t = (Date.now() - startTime) / 1000;
    ctx.clearRect(0, 0, W, H);
    if (!tree || !tree.root) {
      animId = requestAnimationFrame(animate);
      return;
    }
    const highlightSet = new Set(tree.highlightNodes);

    // 递归布局，计算每个节点坐标
    function dfsLayout(node, depth, lx, rx, y) {
      const midX = (lx + rx) / 2;
      node.drawX = midX;
      node.drawY = y;
      const w = 110;
      const h = 56;

      // 绘制子节点 + 贝塞尔连线
      if (node.leftChild) {
        dfsLayout(node.leftChild, depth + 1, lx, midX, y + 100);
        dfsLayout(node.rightChild, depth + 1, midX, rx, y + 100);
        // 贝塞尔曲线连线
        ctx.beginPath();
        ctx.moveTo(midX - w/2, y + h/2);
        const c1y = y + 45;
        ctx.bezierCurveTo(midX - w/2, c1y, node.leftChild.drawX, node.leftChild.drawY - h/2, node.leftChild.drawX, node.leftChild.drawY - h/2);
        ctx.strokeStyle="#666";
        ctx.lineWidth=2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(midX + w/2, y + h/2);
        ctx.bezierCurveTo(midX + w/2, c1y, node.rightChild.drawX, node.rightChild.drawY - h/2, node.rightChild.drawX, node.rightChild.drawY - h/2);
        ctx.stroke();
      }

      // 立体卡片：高亮节点带缩放呼吸动画
      let scale = 1;
      if (highlightSet.has(node)) {
        scale = 1 + 0.06 * Math.sin(t * 3);
      }
      const realW = w * scale;
      const realH = h * scale;
      const x = midX - realW / 2;
      const ypos = node.drawY - realH / 2;
      const r = 8; // 圆角

      // 【立体感：阴影偏移】
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      roundRect(ctx, x+4, ypos+4, realW, realH, r);
      ctx.fill();
      ctx.restore();

      // 【发光效果 仅高亮节点】
      if (highlightSet.has(node)) {
        ctx.shadowColor = "#ff6b35";
        ctx.shadowBlur = 18;
      }

      // 主体矩形底色
      const grad = ctx.createLinearGradient(x, ypos, x, ypos+realH);
      if(highlightSet.has(node)){
        grad.addColorStop(0, "#ff784e");
        grad.addColorStop(1, "#e64a19");
      }else{
        grad.addColorStop(0, "#f0f8ff");
        grad.addColorStop(1, "#d6e8f7");
      }
      ctx.fillStyle = grad;
      roundRect(ctx, x, ypos, realW, realH, r);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 边框
      ctx.strokeStyle="#335";
      ctx.lineWidth=2;
      roundRect(ctx, x, ypos, realW, realH, r);
      ctx.stroke();

      // 绘制文字，三行信息
      ctx.fillStyle="#111";
      ctx.font="13px Consolas,monospace";
      ctx.textAlign="center";
      const textY = ypos + 18;
      ctx.fillText(`[${node.l},${node.r}]`, midX, textY);
      ctx.fillText(`val:${node.val}`, midX, textY+16);
      ctx.fillText(`lazy:${node.lazy}`, midX, textY+32);
    }

    dfsLayout(tree.root, 0, 10, W-10, 30);
    animId = requestAnimationFrame(animate);
  }
  animate();
}

// 辅助函数：绘制圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
