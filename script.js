document.addEventListener('DOMContentLoaded', () => {
    loadLeaves();
    addBird();
});

const placedPositions = [];

function getRandomPosition(treeContainer) {
    const treeRect = treeContainer.getBoundingClientRect();
    const centerX = treeRect.width / 2;
    const centerY = treeRect.height / 2;
    const radius = Math.min(treeRect.width, treeRect.height) / 2 - 50;

    let x, y;
    let isOverlapping;

    do {
        isOverlapping = false;

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * radius;

        x = centerX + distance * Math.cos(angle);
        y = centerY + distance * Math.sin(angle);

        placedPositions.forEach(pos => {
            const distanceBetween = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (distanceBetween < 50) {
                isOverlapping = true;
            }
        });
    } while (isOverlapping);

    // Store the position as percentages of the container size
    const percentX = (x / treeRect.width) * 100;
    const percentY = (y / treeRect.height) * 100;

    placedPositions.push({ x: percentX, y: percentY });
    return { x: percentX, y: percentY };
}

function getRandomRotation() {
    return Math.floor(Math.random() * 60) - 30;
}

function getRandomColor() {
    const greenShades = [
        '#3CB371', '#2E8B57', '#228B22', '#006400', '#32CD32', '#00FF00', '#7CFC00'
    ];
    return greenShades[Math.floor(Math.random() * greenShades.length)];
}

function addLeaf() {
    const message = document.getElementById('leaf-message').value;

    if (message === "") {
        alert("Please enter a message for the leaf.");
        return;
    }

    const treeContainer = document.querySelector('.tree-container');
    const leaf = document.createElement('div');
    leaf.className = 'leaf';

    const textNode = document.createElement('p');
    textNode.textContent = message;
    leaf.appendChild(textNode);

    const position = getRandomPosition(treeContainer);
    leaf.style.left = position.x + '%'; // Position in percentage
    leaf.style.top = position.y + '%';  // Position in percentage

    leaf.style.backgroundColor = getRandomColor();
    leaf.style.transform = `rotate(${getRandomRotation()}deg)`;

    let clickCount = 0;
    let firstClickTime = 0;
    leaf.addEventListener('click', () => {
        const currentTime = new Date().getTime();
        if (currentTime - firstClickTime > 400) {
            clickCount = 0;
        }

        clickCount++;
        firstClickTime = currentTime;

        if (clickCount === 3) {
            leaf.remove();
            removeLeafFromStorage(message);
        }
    });

    treeContainer.appendChild(leaf);
    saveLeaf(message, position, leaf.style.backgroundColor, leaf.style.transform);
    enableLeafDragging(leaf);

    document.getElementById('leaf-message').value = '';
}

function saveLeaf(message, position, color, rotation) {
    const leaves = JSON.parse(localStorage.getItem('leaves')) || [];
    leaves.push({ message, position, color, rotation });
    localStorage.setItem('leaves', JSON.stringify(leaves));
}

function loadLeaves() {
    const treeContainer = document.querySelector('.tree-container');
    const leaves = JSON.parse(localStorage.getItem('leaves')) || [];

    leaves.forEach(leafData => {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';

        const textNode = document.createElement('p');
        textNode.textContent = leafData.message;
        leaf.appendChild(textNode);

        leaf.style.left = leafData.position.x + '%'; // Use percentage for left
        leaf.style.top = leafData.position.y + '%';  // Use percentage for top
        leaf.style.backgroundColor = leafData.color;
        leaf.style.transform = leafData.rotation;

        let clickCount = 0;
        let firstClickTime = 0;
        leaf.addEventListener('click', () => {
            const currentTime = new Date().getTime();
            if (currentTime - firstClickTime > 400) {
                clickCount = 0;
            }

            clickCount++;
            firstClickTime = currentTime;

            if (clickCount === 3) {
                leaf.remove();
                removeLeafFromStorage(leafData.message);
            }
        });

        treeContainer.appendChild(leaf);
        enableLeafDragging(leaf);
    });
}

function removeLeafFromStorage(message) {
    const leaves = JSON.parse(localStorage.getItem('leaves')) || [];
    const updatedLeaves = leaves.filter(leaf => leaf.message !== message);
    localStorage.setItem('leaves', JSON.stringify(updatedLeaves));
}

function removeAllLeaves() {
    const codeInput = document.getElementById('remove-code').value;
    if (codeInput === '333') {
        const treeContainer = document.querySelector('.tree-container');
        const leaves = treeContainer.querySelectorAll('.leaf');
        leaves.forEach(leaf => leaf.remove());

        localStorage.removeItem('leaves');
    }
    document.getElementById('remove-code').value = '';
}

function enableLeafDragging(leaf) {
    let offsetX, offsetY;

    leaf.setAttribute('draggable', true);

    leaf.addEventListener('dragstart', (event) => {
        const rect = leaf.getBoundingClientRect();
        const treeRect = document.querySelector('.tree-container').getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        const emptyImg = new Image();
        emptyImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
        event.dataTransfer.setDragImage(emptyImg, 0, 0);
    });

    leaf.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    leaf.addEventListener('dragend', (event) => {
        const treeContainer = document.querySelector('.tree-container');
        const treeRect = treeContainer.getBoundingClientRect();

        let newX = (event.clientX - treeRect.left - offsetX) / treeRect.width * 100;
        let newY = (event.clientY - treeRect.top - offsetY) / treeRect.height * 100;

        if (newX >= 0 && newX <= 100) {
            leaf.style.left = newX + '%';
        }
        if (newY >= 0 && newY <= 100) {
            leaf.style.top = newY + '%';
        }

        updateLeafPositionInStorage(leaf.textContent, { x: newX, y: newY });
    });
}

function updateLeafPositionInStorage(message, newPosition) {
    const leaves = JSON.parse(localStorage.getItem('leaves')) || [];
    const leafIndex = leaves.findIndex(leaf => leaf.message === message);

    if (leafIndex !== -1) {
        leaves[leafIndex].position = newPosition;
        localStorage.setItem('leaves', JSON.stringify(leaves));
    }
}

function addBird() {
    const treeContainer = document.querySelector('.tree-container');
    const bird = document.createElement('div');
    bird.className = 'bird';

    bird.style.left = '180px';
    bird.style.top = '50px';

    treeContainer.appendChild(bird);

    bird.addEventListener('click', () => {
        const { x, y } = getRandomPosition(treeContainer);
        const heart = createHeart(bird);

        bird.style.transition = 'left 2s ease, top 2s ease';
        bird.style.left = x + '%';
        bird.style.top = y + '%';

        if (x < parseFloat(bird.style.left)) {
            bird.style.transform = 'scaleX(-1)';
        } else {
            bird.style.transform = 'scaleX(1)';
        }

        treeContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 2000);
    });
}

function createHeart(bird) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.style.left = bird.style.left;
    heart.style.top = bird.style.top;
    heart.style.position = 'absolute';
    return heart;
}
