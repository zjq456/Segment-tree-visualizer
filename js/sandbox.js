// js/sandbox.js
function compilePushup(userCode) {
  try {
    // 创建函数，参数固定 node, l, r
    const fn = new Function('node', 'l', 'r', userCode);
    return fn;
  } catch (e) {
    alert(`pushup代码编译错误: ${e.message}`);
    return null;
  }
}

function compilePushdown(userCode) {
  try {
    const fn = new Function('node', 'l', 'r', userCode);
    return fn;
  } catch (e) {
    alert(`pushdown代码编译错误: ${e.message}`);
    return null;
  }
}
