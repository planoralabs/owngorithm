# OWNGORITHM — Guia de Integração de APIs

Este documento centraliza o conhecimento técnico sobre as conexões de dados do ecossistema Owngorithm, as limitações encontradas e as soluções adotadas.

---

## 🎵 Música & Áudio

### Spotify (API Oficial)
- **Status crítico**: Altamente restrita (pós-Março 2026).
- **Limitações**: 
    - Requer conta **Premium** para o desenvolvedor criar Client IDs.
    - Modo de desenvolvimento limitado a **5 usuários manuais**.
    - Escala para produção exige ser empresa registrada e ter +250 mil usuários ativos (MAU).
- **Decisão**: Mantida como opção secundária/legada para automação de playlists, mas desativada para extração de dados em tempo real no Dashboard.

### Last.fm (Integração Principal)
- **Status**: **Ativo e Configurado**.
- **Função**: Atua como um "proxy" para o Spotify. O usuário ativa o Scrobbling no Spotify, e o Owngorithm lê os dados do Last.fm.
- **Vantagens**: 
    - API 100% gratuita para desenvolvedores.
    - Sem limite de usuários por Client ID.
    - Captura `Now Playing`, `Recent Tracks` e `Top Charts`.
- **Implementação**: Localizada em `src/lastfmService.js`. API Key global do app configurada em constante; usuários fornecem apenas o username.

---

## 💻 Desenvolvimento & Produtividade

### GitHub
- **Status**: Widget visual pronto; Lógica de API pendente.
- **Viabilidade**: **Alta**.
- **Estratégia**: Uso de APIs públicas (`https://api.github.com/users/{user}/events`) para capturar commits e atividade recente sem necessidade de OAuth complexo para dados básicos.

---

## 🏃 Saúde & Movimento

### Strava
- **Status**: Widget visual pronto; Lógica de API pendente.
- **Viabilidade**: **Média/Alta**.
- **Estratégia**: Requer fluxo de OAuth2. Permite rastrear distâncias, tipos de atividade e frequência. Bem documentada, mas possui limites de taxa (rate limits) para aplicações em escala.

---

## 🚫 Serviços Removidos / Inviáveis

Os serviços abaixo foram removidos do Dashboard principal por falta de APIs oficiais que permitam ao usuário extrair seus próprios dados de forma programática:

- **TikTok / X (Twitter) / Instagram**: Bloqueio sistêmico ("Sandboxing"). Estes serviços não permitem que um Web App externo leia o histórico de visualizações ou curtidas por motivos de privacidade/segurança corporativa.
- **Solução Futura**: Estes dados só poderão ser integrados através da **Extensão de Navegador Owngorithm (Fase 2)**, que atuará como um "scraper" local com permissão do usuário.

---

## 🔑 Segurança de Chaves
- **Chaves de App**: Devem ser mantidas em constantes no código (ex: `LASTFM_API_KEY`) ou variáveis de ambiente se o projeto crescer para um backend dedicado.
- **Chaves de Usuário**: Armazenadas via `localStorage` (Navegador) para garantir que cada pessoa veja apenas seus próprios dados musicais.

