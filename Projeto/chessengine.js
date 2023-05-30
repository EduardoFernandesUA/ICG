import { waitFor } from "./helpers";


let API_TOKEN = 'PASS'


class ChessEngine {
    constructor(board) {
        this.IS_ENGINE_READY = false
        this.socket = new WebSocket("ws://localhost:4000");

        this.socket.addEventListener('open', event => {
            this.socket.send(JSON.stringify({ type: 'authenticate', token: API_TOKEN }))
            this.sendMessage("uci")
        })

        this.socket.addEventListener('message', async event => {
            // console.debug(event, event.data);
            console.log(1)
            const eventData = JSON.parse(event.data);
          
            if (eventData.type === 'auth:authenticated') {
              console.info('<< auth:authenticated');
            } else if (eventData.type === 'auth:unauthenticated') {
              console.info('<< auth:unauthenticated');
            } else if (eventData.type === 'uci:response') {
            //   console.info('<< uci:response', eventData.payload);
          
              if (eventData.payload === 'readyok') {
                this.IS_ENGINE_READY = true;
                return;
              } else if( board.gettingCurrentPossibleMoves && eventData.payload.length==7 ) {
                board.currentPossibleMoves.push(eventData.payload.substring(0,4))
              }
              
            }
        })
    }

    async sendMessage(str) {
        console.info('>> uci:command', str);
        this.socket.send(JSON.stringify({ type: 'uci:command', payload: str }));
    }

    async waitForEngineToBeReady(inMs) {
        this.IS_ENGINE_READY = false;
        let elapsedTime = 0;
        this.sendMessage('isready');
        while (!this.IS_ENGINE_READY) {
            if (elapsedTime >= 30000) {
                const errorMessage = 'Something went wrong, the server is still not ready after waiting for 30s.';
                throw new Error(errorMessage);
            }
            await waitFor(1000);
            elapsedTime += 1000;
        }
        return true;
    }
}

    //     this.socket.addEventListener('message', event => {
    //         console.debug(event, event.data)
          
    //         const eventData = JSON.parse(event.data)
    //         console.log(eventData)
          
    //         if (eventData.type === 'auth:authenticated') {
    //           console.info('<< auth:authenticated')
    //         } else if (eventData.type === 'auth:unauthenticated') {
    //           console.info('<< auth:unauthenticated')
    //         } else if (eventData.type === 'uci:response') {
    //           console.info('<< uci:response', eventData.payload)
          
    //           if (eventData.payload === 'readyok') {
    //             this.IS_ENGINE_READY = true
    //             return
    //           }
              
    //         }
    //       })
    // }

    // async processFen(fen) {
    //     // updateChessboard(fen)

    //     // responseElement.textContent = `New game: waiting for engine to be ready...`
    //     console.info('>> uci:command', 'ucinewgame')
    //     this.socket.send(JSON.stringify({ type: 'uci:command', payload: 'ucinewgame' }))
    //     await this.waitForEngineToBeReady()

    //     // responseElement.textContent = `Looking for best move (depth=25)...`
    //     const uciCommands = [`position startpost`, 'go depth 15']

    //     uciCommands.forEach(async uciCommand => {
    //         console.info('>> uci:command', uciCommand)

    //         this.socket.send(JSON.stringify({ type: 'uci:command', payload: uciCommand }))
    //     })
    // }

    // async waitFor(inMs) {
    //     return new Promise(resolve => setTimeout(resolve, inMs))
    // }

    // async waitForEngineToBeReady(inMs) {
    //     this.IS_ENGINE_READY = false
    //     let elapsedTime = 0
    //     const timeoutInMs = 30000

    //     this.socket.send(JSON.stringify({ type: 'uci:command', payload: 'isready' }))

    //     while (!this.IS_ENGINE_READY) {
    //         if (elapsedTime >= timeoutInMs) {
    //             const errorMessage = 'Something went wrong, the server is still not ready after waiting for 30s.'

    //             // responseElement.textContent = errorMessage

    //             throw new Error(errorMessage)
    //         }

    //         await this.waitFor(1000)

    //         elapsedTime += 1000
    //     }

    //     return true
    // }
// }

export { ChessEngine };