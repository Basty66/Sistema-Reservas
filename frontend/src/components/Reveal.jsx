import useReveal from '../hooks/useReveal'

export default function Reveal({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
  as: Tag = 'div',
  threshold,
  once = true,
}) {
  const [ref, visible] = useReveal({ threshold, once })

  const animations = {
    'fade-up': 'translate-y-10 opacity-0',
    'fade-down': '-translate-y-10 opacity-0',
    'fade-left': '-translate-x-14 opacity-0',
    'fade-right': 'translate-x-14 opacity-0',
    'scale-in': 'scale-75 opacity-0',
    'zoom-in': 'scale-90 opacity-0',
  }

  const hiddenClass = animations[animation] || animations['fade-up']

  return (
    <Tag
      ref={ref}
      className={`${className} transition-all duration-[900ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform ${
        visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : hiddenClass
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
