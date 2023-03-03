const { createApp, reactive } = Vue;
// const { axios } = Axios;
const MAXLEN = 3;
const TIMES = 4; //繰り返す回数

const QuizData = reactive({
    word_list: ["tomato", "internet", "urban", "design", "game", "glass", "money", "book"],
    select_list: [], //画像生成に選んだ単語リスト
    imgsrc: "",
    turn_flag: false, //選ぶ人 false-> A, true->B
    end_flag: 0,      //終了判定フラグ
    componentId: "select-word",
    a_point: 0,
    b_point: 0,
});

const app = createApp({
    data(){
        return{
            componentId: QuizData.componentId,
            turn_flag: QuizData.turn_flag,
        }
    },
    computed: {
        currentId(){
            return QuizData.componentId;
        },
        currentflag(){
            return QuizData.turn_flag;
        }
    },
})

//画像を生成するための単語を選ぶコンポーネント
app.component(
    'select-word',
    {
        data(){
            return{
                word_list: QuizData.word_list,
                select_list: [],
                turn_flag:QuizData.turn_flag
            }
        },
        methods: {
            input_answer(word){
                if(this.select_list.length >= MAXLEN){
                    this.select_list.push(word);
                    this.select_list.shift();
                }
                else{
                    this.select_list.push(word);
                }
                return console.log(word);
            },
            makeimg(){
                let words = `${this.select_list[0]} ${this.select_list[1]} ${this.select_list[2]}`
                let post = axios.post("http://localhost:3000/", { word: words }).then((response) => {
                    console.log("postで送信");
                    this.catchimg(response.data);
                }).catch((err) =>{
                    console.log("エラー");           
                    console.log(err);    
                });
            },
            catchimg(img){
                //imgはbase64形式
                QuizData.select_list = this.select_list; //正解を格納
                this.select_list = [];
                QuizData.imgsrc = "data:image/png;base64," + img;
                // QuizData.turn_flag = !QuizData.turn_flag;
                QuizData.componentId = "answer";
                // document.getElementById("img").src = "data:image/png;base64," + img;
            },
        },
        template: `
        <h1 v-if="!turn_flag">Aが出題者です</h1>
        <h1 v-else>Bが出題者です</h1>
        <h2>単語を3つ選んでください</h2>
        <div v-for="i in word_list" :key="i">
            <button @click="input_answer(i)" :id="i">{{ i }}</button>
        </div>
        <h3>選んでいる単語</h3>
        <div v-for="i in select_list" :key="i">
            <h4>{{ i }}</h4>
        </div>
        <button @click="makeimg">
            作成する
        </button>
        `
    }
)

// 作成者と推測者のターンをスイッチするためのフラグを変えるコンポーネント
// app.component(
//     'change-turn',
//     {
//         data: function(){
//             turn_flag = false;
//             return{
//             }
//         }
//     }
// )

// 推測者のターンを表示するコンポーネント
app.component(
    'turn-guess',
    {
        data(){
            return{
                
            }
        },
        template: `
            <h4>単語を当てる人のターンです</h4>
            <p>画像を作った単語を、最大3つまで推測して選んでください</p>
        `
    }
)
//推測画面を表示するコンポーネント
app.component(
    'answer',
    {
        data(){
            return{
                word_list: QuizData.word_list,
                select_list: [], //回答者が選択した単語リスト
                imgsrc: QuizData.imgsrc,
                point: 0,
            }
        },
        methods: {
            input_answer(word){
                if(this.select_list.length >= MAXLEN){
                    this.select_list.push(word);
                    this.select_list.shift();
                }
                else{
                    this.select_list.push(word);
                }
                return console.log(word);
            },
            guess_answer(){
                for(let i = 0; i < this.select_list.length; i++){
                    let len = QuizData.select_list.length;
                    let checklist = QuizData.select_list.slice();

                    console.log(QuizData.select_list);
                    // QuizData.spec_list.push(this.select_list[i]);
                    checklist.push(this.select_list[i]);
                    let newlist = new Set(checklist);
                    if(newlist.size == len){
                        this.point++;
                    }
                }
                QuizData.point = this.point;
                console.log(`現在の得点は${QuizData.point}です`);
                
                //turn_flagがfalseのときBのポイント,trueの時Aのポイントに加算
                if (QuizData.turn_flag){
                    QuizData.b_point+=QuizData.point;
                }else{
                    QuizData.a_point+=QuizData.point;
                    
                }
                console.log(`現在のAの得点は${QuizData.a_point}です`);
                console.log(`現在のBの得点は${QuizData.b_point}です`);

                QuizData.componentId = "result";
            }
        },
        template: `
            <h1 v-if="turn_flag">Aが回答者です</h1>
            <h1 v-else>Bが回答者です</h1>
            <img id="img" :src="imgsrc" width="1024" height="1024" />
            <div v-for="i in word_list" :key="i">
            <button @click="input_answer(i)" :id="i">{{ i }}</button>
            </div>
            <h3>選んでいる単語</h3>
            <div v-for="i in select_list" :key="i + '_s'">
                <h4>{{ i }}</h4>
            </div>
            <button type="button" @click=guess_answer>推測する</button>
        `
    }
)

app.component(
    'result',
    {
        data(){
            return{
                point: QuizData.point,
                imgsrc: QuizData.imgsrc,
                a_point:QuizData.a_point,
                b_point:QuizData.b_point,
                select_list:QuizData.select_list
                // end_flag:QuizData.end_flag
            }
        },
        methods: {
            next_turn(){
                QuizData.end_flag++;
                if(QuizData.end_flag >= TIMES){
                    console.log("おわりました");
                    QuizData.componentId = "byebye"
                }else{
                    QuizData.turn_flag = !QuizData.turn_flag;
                    QuizData.componentId = "select-word";
                }
            }
        },
        template:`
            <img id="img" :src="imgsrc" width="1024" height="1024" />
            <h1>{{ point }}点です</h1>

            <h1 >この画像は…
            <div v-for="i in select_list">{{i}},</div>
            を用いて生成されました</h1>
            <h1>Aのポイントは{{ a_point }}点です</h1>
            <h1>Bのポイントは{{ b_point }}点です</h1>
            <button type="button" @click=next_turn>次のターンに進む</button>
        `
    }
)
app.component(
    'byebye',
    {
        data(){
            return{
                a_point:QuizData.a_point,
                b_point:QuizData.b_point
            }
        },
        
        methods: {
            next_game(){
                //次のゲームに向けて初期化
                QuizData.a_point = 0;
                QuizData.b_point = 0;
                QuizData.end_flag = 0;
                QuizData.turn_flag = false;
                QuizData.componentId = "select-word";
            }
        },
        template:`
            <h1>Aのポイントは{{a_point }}点です</h1>
            <h1>Bのポイントは{{ b_point }}点です</h1>
            <h1 v-if = "a_point > b_point">Aの勝利です</h1>
            <h1 v-else-if="a_point < b_point" >Bの勝利です</h1>
            <h1 v-else>引き分けだぁ！</h1>
            <button type="button" @click=next_game>次のゲームへ</button>
        `
    })

app.mount("#main");