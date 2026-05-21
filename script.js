let chart;
const MIN = 0;


function getQueue() {
    return document.getElementById("queue").value
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter(x => !isNaN(x));
}


function getDiskSize() {
    let size = parseInt(document.getElementById("size").value);

    
    if (!isNaN(size) && size > 0) {
        return size;
    }

    
    let queue = getQueue();
    let head = parseInt(document.getElementById("head").value) || 0;

    let maxInput = Math.max(head, ...queue);

    return maxInput + 10;
}


function getDirection(head, input) {
    if (!input) return "right";
    input = input.toLowerCase();
    if (input === "forward") return "right";
    if (input === "backward") return "left";

    let prev = parseInt(input);
    if (!isNaN(prev)) return head > prev ? "right" : "left";

    return "right";
}


function fcfs(queue, head) {
    let seek = 0, seq = [head];
    queue.forEach(q => {
        seek += Math.abs(head - q);
        head = q;
        seq.push(q);
    });
    return { seek, seq };
}


function sstf(queue, head) {
    let seek = 0, seq = [head];
    let q = [...queue];

    while (q.length) {
        let closest = q.reduce((a, b) =>
            Math.abs(b - head) < Math.abs(a - head) ? b : a
        );
        seek += Math.abs(head - closest);
        head = closest;
        seq.push(closest);
        q.splice(q.indexOf(closest), 1);
    }

    return { seek, seq };
}


function scan(queue, head, dirInput, MAX) {
    let seek = 0, seq = [head];
    let dir = getDirection(head, dirInput);

    let left = queue.filter(x => x < head).sort((a,b)=>b-a);
    let right = queue.filter(x => x >= head).sort((a,b)=>a-b);

    if (dir === "right") {
        right.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });

        if (head !== MAX) {
            seek += Math.abs(head - MAX);
            head = MAX;
            seq.push(MAX);
        }

        left.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });

    } else {
        left.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });

        if (head !== MIN) {
            seek += Math.abs(head - MIN);
            head = MIN;
            seq.push(MIN);
        }

        right.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });
    }

    return { seek, seq };
}

function cscan(queue, head, dirInput, MAX) {
    let seek = 0, seq = [head];
    let dir = getDirection(head, dirInput);

    let left = queue.filter(x => x < head).sort((a,b)=>a-b);
    let right = queue.filter(x => x >= head).sort((a,b)=>a-b);

    if (dir === "right") {

        right.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });

        if (head !== MAX) {
            seek += Math.abs(head - MAX);
            head = MAX;
            seq.push(MAX);
        }

        // Jump
        seek += MAX - MIN;
        head = MIN;
        seq.push(MIN);

        left.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });

    } else {

        let leftDesc = [...left].sort((a,b)=>b-a);
        leftDesc.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });

        if (head !== MIN) {
            seek += Math.abs(head - MIN);
            head = MIN;
            seq.push(MIN);
        }

        // Jump
        seek += MAX - MIN;
        head = MAX;
        seq.push(MAX);

        let rightDesc = [...right].sort((a,b)=>b-a);
        rightDesc.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });
    }

    return { seek, seq };
}


function look(queue, head, dirInput) {
    let seek = 0, seq = [head];
    let dir = getDirection(head, dirInput);

    let left = queue.filter(x => x < head).sort((a,b)=>b-a);
    let right = queue.filter(x => x >= head).sort((a,b)=>a-b);

    let order = (dir === "right") ? [right, left] : [left, right];

    order.forEach(arr => {
        arr.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });
    });

    return { seek, seq };
}


function clook(queue, head, dirInput) {
    let seek = 0, seq = [head];
    let dir = getDirection(head, dirInput);

    let left = queue.filter(x => x < head).sort((a,b)=>a-b);
    let right = queue.filter(x => x >= head).sort((a,b)=>a-b);

    if (dir === "right") {

        right.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });

        if (left.length) {
            seek += Math.abs(head - left[0]);
            head = left[0];
            seq.push(head);
        }

        left.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });

    } else {

        let leftDesc = [...left].sort((a,b)=>b-a);
        leftDesc.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });

        if (right.length) {
            let last = right[right.length - 1];
            seek += Math.abs(head - last);
            head = last;
            seq.push(head);
        }

        let rightDesc = [...right].sort((a,b)=>b-a);
        rightDesc.forEach(q => {
            seek += Math.abs(head - q);
            head = q;
            seq.push(q);
        });
    }

    return { seek, seq };
}

// 🎨 Graph
function draw(seq, label) {
    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: 'line',
        data: {
            labels: seq.map((_, i) => i),
            datasets: [{
                label,
                data: seq,
                fill: false,
                tension: 0
            }]
        }
    });
}

// ▶ Run
function run() {
    let queue = getQueue();
    let head = parseInt(document.getElementById("head").value);
    let dir = document.getElementById("direction").value;
    let size = getDiskSize();
    let MAX = size - 1;

    if (!queue.length || isNaN(head)) {
        document.getElementById("result").innerHTML = "Enter valid input!";
        return;
    }

    let algo = document.getElementById("algo").value;
    let result;

    if (algo === "fcfs") result = fcfs(queue, head);
    if (algo === "sstf") result = sstf(queue, head);
    if (algo === "scan") result = scan(queue, head, dir, MAX);
    if (algo === "cscan") result = cscan(queue, head, dir, MAX);
    if (algo === "look") result = look(queue, head, dir);
    if (algo === "clook") result = clook(queue, head, dir);

    document.getElementById("result").innerHTML =
        `Seek Time: ${result.seek}<br>Sequence: ${result.seq.join(" → ")}`;

    draw(result.seq, algo.toUpperCase());
}

// 📊 Compare
function compareAll() {
    let queue = getQueue();
    let head = parseInt(document.getElementById("head").value);
    let dir = document.getElementById("direction").value;
    let size = getDiskSize();
    let MAX = size - 1;

    let results = {
        FCFS: fcfs(queue, head).seek,
        SSTF: sstf(queue, head).seek,
        SCAN: scan(queue, head, dir, MAX).seek,
        "C-SCAN": cscan(queue, head, dir, MAX).seek,
        LOOK: look(queue, head, dir).seek,
        "C-LOOK": clook(queue, head, dir).seek
    };

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: 'bar',
        data: {
            labels: Object.keys(results),
            datasets: [{
                label: "Seek Time",
                data: Object.values(results)
            }]
        }
    });

    let minAlgo = Object.keys(results).reduce((a, b) =>
        results[a] < results[b] ? a : b
    );

    document.getElementById("result").innerHTML =
        Object.entries(results)
            .map(([k, v]) => `${k}: ${v}`)
            .join("<br>") +
        `<br><br><b style="color:green;">Best Algorithm: ${minAlgo}</b>`;
}
