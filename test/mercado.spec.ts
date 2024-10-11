import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('Gerenciamento de Mercados', () => {
    const p = pactum;
    const rep = SimpleReporter;
    const baseUrl = 'https://api-desafio-qa.onrender.com';
    let mercadoId = null;

    p.request.setDefaultTimeout(30000);

    beforeAll(() => p.reporter.add(rep));
    afterAll(() => p.reporter.end());

    describe('Funcionalidades da API de Mercado', () => {
        it('Registrar um novo mercado com sucesso', async () => {
            const response = await p
                .spec()
                .post(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.CREATED)
                .withBody({
                    cnpj: (Math.random() * 100000000000000).toFixed(0),
                    endereco: faker.location.streetAddress(),
                    nome: faker.company.name()
                })
                .returns('mercadoCadastrado.id');

            mercadoId = response;
            console.log(`Mercado registrado com ID: ${mercadoId}`);
        });

        it('Listar todos os mercados existentes', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.OK)
                .expectJsonLike([{
                    id: /.*/,
                    nome: /.*/,
                    endereco: /.*/,
                    cnpj: /.*/
                }]);
        });

        it('Buscar um mercado específico pelo ID', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado/${mercadoId}`)
                .expectStatus(StatusCodes.OK);
        });

        it('Modificar os detalhes de um mercado pelo ID', async () => {
            const dadosAtualizados = {
                cnpj: (Math.random() * 100000000000000).toFixed(0),
                endereco: faker.location.streetAddress(),
                nome: faker.company.name()
            };

            await p
                .spec()
                .put(`${baseUrl}/mercado/${mercadoId}`)
                .expectStatus(StatusCodes.OK)
                .withBody(dadosAtualizados)
                .returns('');

            console.log(`Mercado com ID ${mercadoId} atualizado com sucesso.`);
        });

        it('Tentar registrar um mercado com CNPJ inválido', async () => {
            await p
                .spec()
                .post(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.BAD_REQUEST)
                .withBody({
                    cnpj: '123', // CNPJ inválido
                    endereco: faker.location.streetAddress(),
                    nome: faker.company.name()
                });
        });

        it('Buscar um mercado inexistente pelo ID', async () => {
            const idInvalido = 99999; 
            await p
                .spec()
                .get(`${baseUrl}/mercado/${idInvalido}`)
                .expectStatus(StatusCodes.NOT_FOUND);
        });

        it('Remover um mercado pelo ID', async () => {
            const mercadoIdParaRemover = mercadoId; // Usando o ID do mercado registrado
            await p
                .spec()
                .delete(`${baseUrl}/mercado/${mercadoIdParaRemover}`)
                .expectStatus(StatusCodes.OK);
            console.log(`Mercado com ID ${mercadoIdParaRemover} excluído com sucesso.`);
        });

        it('Tentar remover um mercado inexistente pelo ID', async () => {
            const idInvalido = 99999; 
            await p
                .spec()
                .delete(`${baseUrl}/mercado/${idInvalido}`)
                .expectStatus(StatusCodes.NOT_FOUND);
        });

        it('Verificar a estrutura dos dados ao listar todos os mercados', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.OK)
                .expectJsonLike([{
                    id: /.*/,
                    nome: /.*/,
                    endereco: /.*/,
                    cnpj: /.*/
                }]);
        });

        it('Tentar modificar um mercado que não existe', async () => {
            const idInvalido = 99999; 
            await p
                .spec()
                .put(`${baseUrl}/mercado/${idInvalido}`)
                .expectStatus(StatusCodes.NOT_FOUND)
                .withBody({
                    cnpj: (Math.random() * 100000000000000).toFixed(0),
                    endereco: faker.location.streetAddress(),
                    nome: faker.company.name()
                });
        });

        it('Registrar múltiplos mercados e verificar a contagem', async () => {
            const promessas = [];
            for (let i = 0; i < 5; i++) {
                promessas.push(
                    p.spec()
                    .post(`${baseUrl}/mercado`)
                    .expectStatus(StatusCodes.CREATED)
                    .withBody({
                        cnpj: (Math.random() * 100000000000000).toFixed(0),
                        endereco: faker.location.streetAddress(),
                        nome: faker.company.name()
                    })
                );
            }
            await Promise.all(promessas);
            const response = await p.spec().get(`${baseUrl}/mercado`).expectStatus(StatusCodes.OK);
            expect(response.length).toBeGreaterThan(5); 
        });

        it('Obter um mercado com todos os seus detalhes', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado/${mercadoId}`)
                .expectStatus(StatusCodes.OK)
                .expectJsonLike({
                    id: mercadoId,
                    nome: /.*/,
                    endereco: /.*/,
                    cnpj: /.*/
                });
        });

        it('Tentar registrar um mercado sem nome', async () => {
            await p
                .spec()
                .post(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.BAD_REQUEST)
                .withBody({
                    cnpj: (Math.random() * 100000000000000).toFixed(0),
                    endereco: faker.location.streetAddress(),
                    nome: '' 
                });
        });

        it('Confirmar a resposta ao buscar um mercado removido', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado/${mercadoId}`)
                .expectStatus(StatusCodes.NOT_FOUND); 
        });
    });
});
