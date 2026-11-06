<?php
/**
 * Child theme "Clínica Movimento".
 *
 * Responsabilidades deste arquivo:
 *  - carregar o CSS do tema pai e do filho;
 *  - montar o cabeçalho com navegação e o rodapé do site;
 *  - injetar o botão flutuante de WhatsApp;
 *  - instalar o Google Analytics, quando configurado;
 *  - remover do caminho crítico o que o WordPress e o Elementor carregam
 *    por padrão e este site não usa.
 *
 * O visual vive em style.css. A estrutura e os textos de cada página vivem
 * nos templates do Elementor, em elementor/*.json.
 *
 * @package clinica-movimento
 */

defined( 'ABSPATH' ) || exit;

/* -------------------------------------------------------------------------
 * Configuração
 *
 * O ID de medição do Analytics NÃO fica no repositório. Defina em
 * wp-config.php:
 *
 *     define( 'FM_GA_MEASUREMENT_ID', 'G-XXXXXXXXXX' );
 *
 * Sem a constante, nenhum script de medição é impresso -- o correto para
 * repositório público e para ambiente local.
 * ---------------------------------------------------------------------- */

/**
 * Configuração do site, filtrável.
 *
 * @return array<string,mixed>
 */
function fm_config() {
	return apply_filters(
		'fm_config',
		array(
			// Trocar pelos dados reais antes de publicar.
			'whatsapp_phone'   => '5511999999999',
			'whatsapp_message' => 'Olá! Gostaria de informações sobre as consultas na Clínica Movimento.',
			'whatsapp_label'   => 'WhatsApp',
			'whatsapp_aria'    => 'Abrir conversa no WhatsApp',
			'telefone'         => '(11) 3000-0000',
			'telefone_link'    => '+551130000000',
			'email'            => 'contato@clinicamovimento.com.br',
			'cta_label'        => 'Agendar avaliação',
			'cta_slug'         => 'contato',
			// Imagem do hero da home, para preload. Atualizar após subir a real.
			'hero_image'       => '',
		)
	);
}

/**
 * Itens de navegação usados quando nenhum menu do WordPress foi atribuído.
 *
 * O site tem quatro páginas fixas, então vale ter um padrão que funciona
 * sem configuração nenhuma. Assim que o cliente criar um menu em
 * Aparência → Menus e atribuí-lo ao local "Principal", ele passa a valer.
 *
 * @return array<int,array<string,string>>
 */
function fm_nav_padrao() {
	return array(
		array( 'rotulo' => 'Início',   'slug' => '' ),
		array( 'rotulo' => 'Sobre',    'slug' => 'sobre' ),
		array( 'rotulo' => 'Serviços', 'slug' => 'servicos' ),
		array( 'rotulo' => 'Contato',  'slug' => 'contato' ),
	);
}

/**
 * Monta o link wa.me com a mensagem já preenchida.
 *
 * @return string
 */
function fm_whatsapp_url() {
	$cfg = fm_config();

	return sprintf(
		'https://wa.me/%s?text=%s',
		rawurlencode( $cfg['whatsapp_phone'] ),
		rawurlencode( $cfg['whatsapp_message'] )
	);
}

/**
 * URL de uma página do site a partir do slug.
 *
 * @param string $slug Slug da página, ou string vazia para a home.
 * @return string
 */
function fm_url( $slug ) {
	return $slug ? home_url( '/' . $slug . '/' ) : home_url( '/' );
}

/**
 * Diz se o slug informado corresponde à página sendo exibida.
 *
 * @param string $slug Slug da página.
 * @return bool
 */
function fm_pagina_atual( $slug ) {
	if ( '' === $slug ) {
		return is_front_page();
	}

	return is_page( $slug );
}

/* -------------------------------------------------------------------------
 * Estilos e menus
 * ---------------------------------------------------------------------- */

add_action( 'after_setup_theme', 'fm_setup' );
/**
 * Registra o local de menu e os suportes do tema.
 *
 * @return void
 */
function fm_setup() {
	register_nav_menus( array( 'principal' => 'Menu principal' ) );
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array( 'navigation-widgets', 'style', 'script' ) );
}

add_action( 'wp_enqueue_scripts', 'fm_enqueue_styles', 20 );
/**
 * Carrega o CSS do tema pai e do filho.
 *
 * @return void
 */
function fm_enqueue_styles() {
	$theme = wp_get_theme();

	wp_enqueue_style(
		'hello-elementor-child',
		get_stylesheet_directory_uri() . '/style.css',
		array( 'hello-elementor' ),
		$theme->get( 'Version' )
	);
}

/* -------------------------------------------------------------------------
 * Performance
 * ---------------------------------------------------------------------- */

add_action( 'init', 'fm_trim_default_assets' );
/**
 * Remove do caminho crítico o que este site não usa.
 *
 * @return void
 */
function fm_trim_default_assets() {
	// Script de emoji: ~12KB de JS mais uma requisição a s.w.org.
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );

	remove_action( 'wp_head', 'rsd_link' );
	remove_action( 'wp_head', 'wlwmanifest_link' );
	remove_action( 'wp_head', 'wp_generator' );
	remove_action( 'wp_head', 'wp_shortlink_wp_head' );
	remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10 );
}

add_action( 'wp_enqueue_scripts', 'fm_dequeue_unused_assets', 100 );
/**
 * Retira estilos e scripts enfileirados que este site não utiliza.
 *
 * @return void
 */
function fm_dequeue_unused_assets() {
	if ( is_admin() ) {
		return;
	}

	// CSS do editor de blocos: as páginas são montadas no Elementor.
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'classic-theme-styles' );

	wp_dequeue_script( 'wp-embed' );
	wp_deregister_script( 'wp-embed' );

	// Font Awesome. Os templates foram construídos sem widget de ícone:
	// os check e os ícones dos cards são SVG inline em background-image.
	wp_dequeue_style( 'font-awesome' );
	wp_dequeue_style( 'elementor-icons-shared-0' );
	wp_dequeue_style( 'elementor-icons-fa-solid' );
	wp_dequeue_style( 'elementor-icons-fa-regular' );
	wp_dequeue_style( 'elementor-icons-fa-brands' );
}

// A Inter é servida localmente por este tema, então o Elementor não precisa
// chamar fonts.googleapis.com.
add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );

add_action( 'wp_head', 'fm_resource_hints', 1 );
/**
 * Preload das fontes locais e da imagem do hero da home.
 *
 * @return void
 */
function fm_resource_hints() {
	$dir = get_stylesheet_directory();
	$uri = get_stylesheet_directory_uri();

	foreach ( array( 'inter-400.woff2', 'inter-700.woff2' ) as $font ) {
		// Preload de arquivo ausente gera 404 e aviso no console.
		if ( ! file_exists( $dir . '/fonts/' . $font ) ) {
			continue;
		}

		printf(
			'<link rel="preload" as="font" type="font/woff2" href="%s" crossorigin>' . "\n",
			esc_url( $uri . '/fonts/' . $font )
		);
	}

	$hero = fm_config()['hero_image'];

	if ( $hero && is_front_page() ) {
		printf(
			'<link rel="preload" as="image" href="%s" fetchpriority="high">' . "\n",
			esc_url( $hero )
		);
	}
}

add_action( 'template_redirect', 'fm_prioritize_hero_image' );
/**
 * Tira o lazy loading da primeira imagem da página e marca a prioridade.
 *
 * O WordPress acrescenta `loading="lazy"` em praticamente toda imagem, e o
 * Elementor renderiza dentro de `the_content`. Para o elemento de LCP isso
 * é o oposto do desejado: adia justamente a imagem que define a nota.
 *
 * @return void
 */
function fm_prioritize_hero_image() {
	if ( is_admin() ) {
		return;
	}

	ob_start(
		function ( $html ) {
			$posicao = strpos( $html, '<img' );

			if ( false === $posicao ) {
				return $html;
			}

			$fim = strpos( $html, '>', $posicao );

			if ( false === $fim ) {
				return $html;
			}

			$tag = substr( $html, $posicao, $fim - $posicao + 1 );

			// Remove antes de redefinir: o Elementor já emite decoding.
			$nova = preg_replace( '/\s+loading=(["\'])[^"\']*\1/i', '', $tag );
			$nova = preg_replace( '/\s+fetchpriority=(["\'])[^"\']*\1/i', '', $nova );
			$nova = preg_replace( '/\s+decoding=(["\'])[^"\']*\1/i', '', $nova );
			$nova = preg_replace( '/^<img/', '<img fetchpriority="high" decoding="async"', $nova );

			return substr_replace( $html, $nova, $posicao, strlen( $tag ) );
		}
	);
}

/* -------------------------------------------------------------------------
 * Google Analytics (opcional)
 * ---------------------------------------------------------------------- */

add_action( 'wp_head', 'fm_analytics', 5 );
/**
 * Imprime o GA4 quando a constante estiver definida.
 *
 * @return void
 */
function fm_analytics() {
	if ( ! defined( 'FM_GA_MEASUREMENT_ID' ) || ! FM_GA_MEASUREMENT_ID || is_admin() ) {
		return;
	}

	$id = (string) FM_GA_MEASUREMENT_ID;
	?>
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $id ); ?>"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', <?php echo wp_json_encode( $id ); ?>);
</script>
	<?php
}

/* -------------------------------------------------------------------------
 * Cabeçalho
 * ---------------------------------------------------------------------- */

add_action( 'wp_body_open', 'fm_header' );
/**
 * Cabeçalho com navegação.
 *
 * Fica aqui, e não como template do Elementor, por dois motivos: o Elementor
 * gratuito não tem construtor de cabeçalho, e elemento de posição fixa dentro
 * da árvore do Elementor atrapalha o editor.
 *
 * O menu do celular é um `<details>`, sem JavaScript: o navegador já cuida do
 * acordeão, do foco e do anúncio de estado para leitor de tela.
 *
 * @return void
 */
function fm_header() {
	if ( is_admin() ) {
		return;
	}

	$cfg   = fm_config();
	$itens = fm_nav_padrao();
	$cta   = fm_url( $cfg['cta_slug'] );
	?>
<a class="fm-skip" href="#content">Pular para o conteúdo</a>

<header class="fm-header">
	<div class="fm-header__inner">
		<a class="fm-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
			Clínica <span>Movimento</span>
		</a>

		<nav class="fm-nav" aria-label="Navegação principal">
			<?php foreach ( $itens as $item ) : ?>
				<a href="<?php echo esc_url( fm_url( $item['slug'] ) ); ?>"
					<?php echo fm_pagina_atual( $item['slug'] ) ? ' aria-current="page"' : ''; ?>>
					<?php echo esc_html( $item['rotulo'] ); ?>
				</a>
			<?php endforeach; ?>
		</nav>

		<a class="fm-header__cta" href="<?php echo esc_url( $cta ); ?>">
			<?php echo esc_html( $cfg['cta_label'] ); ?>
		</a>

		<details class="fm-menu">
			<summary aria-label="Abrir o menu de navegação"></summary>
			<div class="fm-menu__panel">
				<?php foreach ( $itens as $item ) : ?>
					<a href="<?php echo esc_url( fm_url( $item['slug'] ) ); ?>"
						<?php echo fm_pagina_atual( $item['slug'] ) ? ' aria-current="page"' : ''; ?>>
						<?php echo esc_html( $item['rotulo'] ); ?>
					</a>
				<?php endforeach; ?>
				<a class="fm-menu__cta" href="<?php echo esc_url( $cta ); ?>">
					<?php echo esc_html( $cfg['cta_label'] ); ?>
				</a>
			</div>
		</details>
	</div>
</header>

<main id="content">
	<?php
}

/* -------------------------------------------------------------------------
 * Rodapé e WhatsApp
 * ---------------------------------------------------------------------- */

add_action( 'wp_footer', 'fm_footer', 5 );
/**
 * Rodapé do site.
 *
 * @return void
 */
function fm_footer() {
	if ( is_admin() ) {
		return;
	}

	$cfg   = fm_config();
	$itens = fm_nav_padrao();
	?>
</main>

<footer class="fm-footer">
	<div class="fm-footer__inner">
		<div>
			<p class="fm-footer__brand">Clínica Movimento</p>
			<p>Clínica de fisioterapia e reabilitação em Pinheiros, São Paulo. Avaliação individual, sessões de 50 minutos e plano terapêutico por escrito.</p>
		</div>

		<div>
			<h2>Navegação</h2>
			<ul>
				<?php foreach ( $itens as $item ) : ?>
					<li><a href="<?php echo esc_url( fm_url( $item['slug'] ) ); ?>"><?php echo esc_html( $item['rotulo'] ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>

		<div>
			<h2>Horário</h2>
			<ul>
				<li>Segunda a sexta, 7h às 20h</li>
				<li>Sábado, 8h às 13h</li>
				<li>Domingo e feriados, fechado</li>
			</ul>
		</div>

		<div>
			<h2>Contato</h2>
			<ul>
				<li><a href="<?php echo esc_url( fm_whatsapp_url() ); ?>" target="_blank" rel="noopener noreferrer">WhatsApp (11) 99999-9999</a></li>
				<li><a href="tel:<?php echo esc_attr( $cfg['telefone_link'] ); ?>"><?php echo esc_html( $cfg['telefone'] ); ?></a></li>
				<li><a href="mailto:<?php echo esc_attr( $cfg['email'] ); ?>"><?php echo esc_html( $cfg['email'] ); ?></a></li>
				<li>Rua das Acácias, 120 — Pinheiros, São Paulo — SP</li>
			</ul>
		</div>
	</div>

	<div class="fm-footer__bottom">
		<p class="fm-footer__demo">Este é um site de demonstração criado para portfólio. A Clínica Movimento é fictícia, os profissionais são personagens e o endereço não existe. Nenhum agendamento é processado aqui.</p>
		<p class="fm-footer__legal">As informações desta página têm caráter informativo e não substituem consulta, diagnóstico ou tratamento de profissional de saúde habilitado. A indicação de qualquer procedimento depende de avaliação individual. Responsável técnica: Dra. Helena Vasconcelos — CREFITO-3 000000-F.</p>
		<p class="fm-footer__credit">Desenvolvido por Bruno Bigelli · WordPress e Elementor</p>
	</div>
</footer>
	<?php
}

add_action( 'wp_footer', 'fm_whatsapp_button', 20 );
/**
 * Botão flutuante de WhatsApp.
 *
 * O ícone é SVG inline: um arquivo a menos para baixar e nenhuma dependência
 * de biblioteca de ícones, que foi retirada do site de propósito.
 *
 * @return void
 */
function fm_whatsapp_button() {
	if ( is_admin() ) {
		return;
	}

	$cfg = fm_config();
	?>
<a class="fm-wa" href="<?php echo esc_url( fm_whatsapp_url() ); ?>"
   target="_blank" rel="noopener noreferrer"
   aria-label="<?php echo esc_attr( $cfg['whatsapp_aria'] ); ?>">
	<svg class="fm-wa__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
		<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.92 1.17-.15.2-.3.22-.6.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.67-2.09-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.62-.93-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35z"/>
		<path d="M12.04 2C6.6 2 2.17 6.43 2.17 11.87c0 1.74.46 3.44 1.32 4.94L2 22l5.33-1.4a9.84 9.84 0 0 0 4.7 1.2h.01c5.44 0 9.87-4.43 9.87-9.87 0-2.64-1.03-5.12-2.9-6.99A9.8 9.8 0 0 0 12.04 2zm0 18.06h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.03-.2-.31a8.17 8.17 0 0 1-1.25-4.34c0-4.52 3.68-8.2 8.2-8.2a8.15 8.15 0 0 1 8.2 8.21c0 4.52-3.68 8.18-8.2 8.18z"/>
	</svg>
	<span class="fm-wa__label"><?php echo esc_html( $cfg['whatsapp_label'] ); ?></span>
</a>
	<?php
}

/* -------------------------------------------------------------------------
 * SEO e acessibilidade
 * ---------------------------------------------------------------------- */

add_filter( 'language_attributes', 'fm_force_locale' );
/**
 * Garante lang="pt-BR" no html.
 *
 * Leitor de tela pronuncia o texto com as regras do idioma declarado: com
 * lang errado, a página inteira é lida com fonética de outra língua.
 *
 * @param string $output Atributos atuais.
 * @return string
 */
function fm_force_locale( $output ) {
	return is_admin() ? $output : 'lang="pt-BR"';
}

add_action( 'wp_head', 'fm_local_business_schema', 20 );
/**
 * Dados estruturados de estabelecimento de saúde.
 *
 * Ajuda o Google a entender endereço, horário e telefone, que é o que mais
 * importa para busca local -- o tipo de busca que traz paciente para uma
 * clínica de bairro.
 *
 * @return void
 */
function fm_local_business_schema() {
	if ( is_admin() || ! is_front_page() ) {
		return;
	}

	$cfg = fm_config();

	$schema = array(
		'@context'    => 'https://schema.org',
		'@type'       => 'MedicalClinic',
		'name'        => 'Clínica Movimento',
		'description' => 'Clínica de fisioterapia e reabilitação em Pinheiros, São Paulo.',
		'url'         => home_url( '/' ),
		'telephone'   => $cfg['telefone_link'],
		'email'       => $cfg['email'],
		'address'     => array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => 'Rua das Acácias, 120 — conjunto 42',
			'addressLocality' => 'São Paulo',
			'addressRegion'   => 'SP',
			'postalCode'      => '05000-000',
			'addressCountry'  => 'BR',
		),
		'openingHoursSpecification' => array(
			array(
				'@type'     => 'OpeningHoursSpecification',
				'dayOfWeek' => array( 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ),
				'opens'     => '07:00',
				'closes'    => '20:00',
			),
			array(
				'@type'     => 'OpeningHoursSpecification',
				'dayOfWeek' => array( 'Saturday' ),
				'opens'     => '08:00',
				'closes'    => '13:00',
			),
		),
		'medicalSpecialty' => 'PhysicalTherapy',
	);

	printf(
		'<script type="application/ld+json">%s</script>' . "\n",
		wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
	);
}
